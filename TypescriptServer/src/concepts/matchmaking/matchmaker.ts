import Client from '#concepts/client';
import Lobby, { lobbyList } from '#concepts/lobby';
import Ticket, { MatchRequirements, PartyTicket, SingleTicket } from '#matchmaking/ticket';
import Party from '#concepts/party';
import Queue from '#matchmaking/queue';
import { gameModeGet } from '#concepts/game_mode';
import Match from './match';

export type Queues = {
    [mode: string]: Queue
};

export default class MatchMaker {
    static queues:Queues = {};
    static _interval = null; // used for the setInterval() loop

    // an internal loop
    static processMatches() {
        // handle each mode's queue separately
        for(let mode in this.queues) {
            let match_found = true;

            let game_mode = global.game_modes[mode];
            let q = this.queues[mode];

            let team_size = game_mode.team_size;

            let teams:Ticket[][] = [];
            let teams_count = game_mode.teams;
            let teams_filled:number[] = [];
            let teams_mmr:number[] = [];

            for(let i = 0; i < teams_count; i++) {
                teams.push([]);
                teams_filled.push(0);
                teams_mmr.push(0);
            }

            // ranked currently only allows full parties and solo players
            if (game_mode.ranked) {
                q.sort(); // sort the queue by mmr

                let potential_pool:Ticket[] = [];
                let pool:Ticket[] = [];

                // add full parties and solo players to the pool of potential players
                potential_pool.push(...q.get_all(1));
                potential_pool.push(...q.get_all(team_size));

                // sort once again
                potential_pool.sort((p1, p2) => p1.mmr - p2.mmr);


                // define the pool of players/parties with close enough mmr for the match
                let players_needed = team_size * teams_count;
                let max_mmr_diff = config.matchmaking.mmr_max_difference;
                let best_diff = Number.MAX_SAFE_INTEGER;

                // modified "sliding window"
                for(let left = 0; left < potential_pool.length; left++) {
                    let p1 = potential_pool[left];
                    let player_count = p1.party_size;

                    let temp_pool = [p1];

                    for(let right = left+1; right < potential_pool.length; right++) {
                        let p2 = potential_pool[right];
                        let psize = p2.party_size;

                        let diff = p2.mmr - p1.mmr;
                        if (diff > max_mmr_diff) {
                            break;
                        }

                        if (player_count + psize <= players_needed) {
                            temp_pool.push(p2);
                            player_count += psize;
                        }

                        if (player_count == players_needed) {
                            if (diff < best_diff) {
                                best_diff = diff;
                                pool = [].concat(...temp_pool);
                            }
                            break;
                        }
                    }
                }

                // not enough players for a match
                if (pool.length == 0) {
                    match_found = false;
                    break; // immediately skip to the next mode
                }


                let idx = 0; // the current index of a team to be filled

                // go backwards to distribute highest mmr players first
                for(let i = pool.length-1; i >= 0; i--) {
                    let ticket = pool[i]; // party ticket

                    if (ticket.party_size == team_size) { // it's a full party
                        // find an empty team
                        idx = teams_filled.findIndex(n => n === 0);
                    }
                    else { // it's a single player

                        // add the highest mmr player to the current lowest mmr team
                        // get the index of a non-filled team with the lowest mmr
                        idx = teams_mmr.reduce((idx, mmr, i) =>
                            ((teams_filled[i] < team_size) && (idx == -1 || mmr < teams_mmr[idx])) ? i : idx, -1);
                    }

                    if (idx !== -1) {
                        teams[idx].push(ticket);
                        teams_filled[idx] += ticket.party_size;
                        teams_mmr[idx] += ticket.avg_mmr * ticket.party_size;
                    }
                }
            }
            // unranked modes allow parties of any size
            else {
                // for each party size up to team size
                for(let party_size = team_size; party_size >= 0; party_size--) {
                    // for each team
                    for(let i = 0; i < teams_count; i++) {
                        let j = 0;
                        // while the i'th team can fit a party of party_size - add one
                        while(teams_filled[i] + party_size <= team_size) {
                            // no more parties of party_size - go to the next party size
                            if (q.count(party_size) > 0) { break; }

                            let party = q.get(party_size, j);

                            teams[i].push(party);
                            teams_filled[i] += party_size;
                            teams_mmr[i] += party.avg_mmr * party_size;
                            j++;
                        }
                    }
                }
            }


            // check if all the teams are packed
            for(let i = 0; i < teams_count; i++) {
                if (teams_filled[i] != team_size) { // not filled
                    match_found = false;
                    break;
                }
            }


            if (!match_found) {
                // skip to the next game mode
                break;
            }


            // remove all the team members from the queue
            for(let i = 0; i < team_size; i++) {
                for(let j = 0; j < teams[i].length; j++) {
                    let ticket = teams[i][j];
                    q.remove(ticket);
                }
            }

            console.log(teams.map(team => team.map(p => p.mmr)));

            // create an instance of Match
            // let match = new Match(mode, teams);

            // the rest (sending, etc.) is handled in the Match() constructor
        }
    }

    static canCreateTicket(by:Client|Party, req:MatchRequirements):boolean {
        let party_size = by instanceof Party ? by.members.length : 1;
        let game_mode = gameModeGet(req.game_mode)

        // don't allow parties bigger than team size
        if (party_size > game_mode.team_size) {
            return false;
        }

        // ranked game modes currently only allow full parties and single players
        let is_full_party = party_size == game_mode.team_size
        let is_single_player = party_size == 1;

        if (game_mode.ranked && !is_full_party && !is_single_player) {
            return false
        }

        // add your conditions here


        return true;
    }

    static createTicket(by:Client|Party, req:MatchRequirements):Ticket|null {
        if (!this.canCreateTicket(by, req)) {
            return null;
        }

        let t:Ticket;
        if (by instanceof Client) {
            t = new SingleTicket(by, req);
        }
        else {
            t = new PartyTicket(by, req);
        }

        t.add();

        return t;
    }
    
    /**
     * picks the first non-full lobby and returns it
     * @param {Client} user
     * @returns {Lobby} lobby
     */
    static findNonfullLobby(user:Client):Lobby {
        var match_lobby = null;
        lobbyList().forEach((lobby) => {
            if (!lobby.full) {
                match_lobby = lobby;
            }
        });

        return match_lobby;
    }

    /**
     * Returns MMR delta (change) for the player 1 depending on the outcome of a match against player 2
     * @param {number} player_mmr
     * @param {number} opponent_mmr 
     * @param {('win'|'loss'|'draw')} result 
     * @returns {number} mmr_delta
     */
    static getMMRDelta(player_mmr:number, opponent_mmr:number, result:'win'|'loss'|'draw'):number {
        // win = 1, loss = 0, draw = 0.5
        let res: number;
        switch(result) {
            case 'win': res = 1; break;
            case 'loss': res = 0; break;
            case 'draw': res = .5; break;
            default: throw `Unexpected match result: ${result}, expected 'win', 'loss' or 'draw'`;
        }

        const k = global.config.matchmaking.mmr_max_gain; // maximum possible gain/loss, when the weakest player wins against the best
        const mmr_scale = global.config.matchmaking.mmr_scale; // the bigger the number, the less the result changes with mmr difference. (e.x. chess uses 400, making a huge difference from even 200 mmr/elo)

        const percent = (player_mmr + opponent_mmr) / player_mmr;
        const transformed_mmr1 = 10 ** (player_mmr / mmr_scale);
        const transformed_mmr2 = 10 ** (opponent_mmr / mmr_scale);

        const expected_result = transformed_mmr1 / (transformed_mmr1 + transformed_mmr2);

        return Math.round(k * (res - expected_result));
    }
}
