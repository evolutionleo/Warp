import { Data } from "#cmd/handlePacket";
import Client from "#concepts/client";
import GameMode from "#concepts/game_mode";
import Lobby, { lobbyCreate } from "#concepts/lobby";
import GameMap from "#concepts/map";
import Party from "#concepts/party";
import Ticket from "#matchmaking/ticket";
import MatchMaker from "./matchmaker";


export default class Match {
    mode: GameMode = null;
    map: GameMap = null;
    teams: Client[][] = [];
    teams_avg_mmr: number[];
    parties: Client[][] = [];

    get players() {
        return this.teams.flatMap(team => team);
    }

    lobby: Lobby;

    constructor(mode_name:string, teams:Ticket[][]) {
        this.mode = global.game_modes[mode_name];
        this.teams = [];

        for(let i = 0; i < teams.length; i++) {
            this.teams.push([]);
            for(let j = 0; j < teams[i].length; j++) {
                let ticket = teams[i][j];
                if (ticket.is_party) { // add every party member to the team
                    let party = (ticket.by as Party);
                    party.members.forEach((c) => this.teams[i].push(c));
                    this.parties.push(party.members);
                }
                else {
                    this.teams[i].push(ticket.by as Client);
                }
            }
        }


        // send the "match found" message to all team members
        this.teams.forEach(team => {
            team.forEach(c => {
                c.onMatchFound(this);
            });
        });


        this.teams_avg_mmr = this.teams.map(team => team.reduce((mmr, c) => c.mmr + mmr, 0) / team.length);

        this.start();
    }

    start() {
        this.lobby = lobbyCreate(this.map);

        this.teams.flatMap(t => t).forEach(client => {
            this.lobby.addPlayer(client);
        });

        // if this config isn't on - add everyone manually
        if (!global.config.lobby.add_into_play_on_full && !global.config.lobby.add_into_play_on_join) {
            this.lobby.play();
        }
    }

    end(winning_teams:number[] = [], reason?:string) {
        this.teams.forEach((team, idx) => {
            let outcome;
            if (winning_teams.length === 0)
                outcome = 'draw';
            else
                outcome = winning_teams.includes(idx) ? 'win' : 'loss';


            // update players' MMR
            if (this.mode.ranked) {
                let other_avg_mmr = this.teams_avg_mmr.reduce((mmr, curr, i) => i == idx ? mmr : curr + mmr, 0) / (this.teams_avg_mmr.length - 1);
                let avg_mmr = this.teams_avg_mmr[idx];

                let mmr_delta = MatchMaker.getMMRDelta(avg_mmr, other_avg_mmr, outcome);

                team.forEach(c => {
                    c.mmr += mmr_delta;
                    c.sendMMRChange(mmr_delta, c.mmr);
                });
            }

            team.forEach(c => {
                c.sendGameOver(outcome, reason);
            });
        });

        this.lobby.close('game over');
    }

    serialize() {
        return {
            map: this.map.getInfo(),
            teams: this.teams.map(t => t.map(c => c.name)),
            parties: this.parties.map(p => p.map(c => c.name))
        }
    }
}