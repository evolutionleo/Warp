import { Data } from "#cmd/handlePacket";
import Client from "#concepts/client";
import GameMode from "#concepts/game_mode";
import Lobby, { lobbyCreate } from "#concepts/lobby";
import GameMap from "#concepts/map";
import Party from "#matchmaking/party";
import Ticket from "#matchmaking/ticket";
import MatchMaker from "#matchmaking/matchmaker";

export type MatchOutcome = 'win'|'loss'|'draw';

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
    ended:boolean = false;

    constructor(mode_name:string, teams:Ticket[][]) {
        this.mode = global.game_modes[mode_name];
        this.selectMap();

        this.teams = [];

        for(let i = 0; i < teams.length; i++) {
            this.teams.push([]);
            for(let j = 0; j < teams[i].length; j++) {
                let ticket = teams[i][j];
                if (ticket.is_party) { // add every party member to the team
                    let party = (ticket.by as Party);
                    party.ticket = null;
                    party.match = this;
                    party.members.forEach((c) => this.teams[i].push(c));
                    this.parties.push(party.members);
                }
                else {
                    this.teams[i].push(ticket.by as Client);
                }
            }
        }

        this.teams_avg_mmr = this.teams.map(team => team.reduce((mmr, c) => c.mmr + mmr, 0) / team.length);

        // send the "match found" message to all team members
        this.teams.forEach(team => {
            team.forEach(c => {
                c.match = this;
                c.ticket = null;
                c.onMatchFound(this);
            });
        });

        this.start();
    }

    selectMap() {
        // pick a random map
        let valid_maps = global.maps.filter(map => map.game_mode === this.mode.name);

        if (valid_maps.length === 0) {
            throw `No valid maps found for a match (game_mode=${this.mode.name})`
        }

        let idx = Math.floor(Math.random() * valid_maps.length);
        this.map = valid_maps[idx];
    }

    start() {
        this.ended = false;

        this.lobby = lobbyCreate(this.map);
        this.lobby.match = this;
        this.lobby.teams = this.teams;

        this.teams.flatMap(t => t).forEach(client => {
            this.lobby.addPlayer(client);
        });

        // if this config isn't on - add everyone manually
        if (!global.config.lobby.add_into_play_on_full && !global.config.lobby.add_into_play_on_join) {
            this.lobby.play();
        }
    }

    end(winning_teams:number[] = [], reason?:string) {
        this.ended = true;

        this.teams.forEach((team, idx) => {
            let outcome:MatchOutcome;
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
                    // don't change the MMR immediately because it will affect other players' calculations
                    setImmediate(() => {
                        c.mmr += mmr_delta;
                        c.sendMMRChange(mmr_delta, c.mmr);
                    });
                });
            }

            team.forEach(c => {
                c.onGameOver(outcome, reason);
            });
        });

        // remove all players
        while(this.players.length > 0) {
            this.removePlayer(this.players[0], 'game over', true, true);
        }

        if (this.lobby.status !== 'closed')
            this.lobby.close('game over');
    }

    removePlayer(player:Client, reason:string='', forced=false, secondary=false) {
        this.teams.forEach(team => {
            let idx = team.indexOf(player);
            if (idx != -1)
                team.splice(idx, 1);
        });

        let idx = this.players.indexOf(player);
        if (idx != -1)
            this.players.splice(idx, 1);

        player.match = null;

        if (!secondary)
            this.lobby.kickPlayer(player, reason, forced, true);
    }

    serialize() {
        return {
            map: this.map.getInfo(),
            teams: this.teams.map(t => t.map(c => c.name)),
            parties: this.parties.map(p => p.map(c => c.name))
        }
    }
}