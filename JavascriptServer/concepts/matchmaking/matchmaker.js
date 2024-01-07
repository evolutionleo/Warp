import Client from '#concepts/client';
import { lobbyList } from '#concepts/lobby';
import { PartyTicket, SingleTicket } from '#matchmaking/ticket';
import Party from '#matchmaking/party';
import { gameModeFind } from '#concepts/game_mode';
import Match from '#matchmaking/match';
import trace from '#util/logging';

export default class MatchMaker {
    static queues = {};
    static _interval = null; // used for the setInterval() loop
    
    // an internal loop
    static processMatches() {
        // handle each mode's queue separately
        for (let mode in this.queues) {
            let match_found = true;
            
            let game_mode = global.game_modes[mode];
            let q = this.queues[mode];
            
            let team_size = game_mode.team_size;
            
            let teams = [];
            let teams_count = game_mode.teams;
            let teams_filled = [];
            let teams_mmr = [];
            
            for (let i = 0; i < teams_count; i++) {
                teams.push([]);
                teams_filled.push(0);
                teams_mmr.push(0);
            }
            
            // ranked currently only allows full parties and solo players
            if (game_mode.ranked) {
                q.sort(); // sort the queue by mmr
                
                let potential_pool = [];
                let pool = [];
                
                // add full parties and solo players to the pool of potential players
                potential_pool.push(...q.get_all(1));
                // (but not twice if team size = 1)
                if (team_size != 1)
                    potential_pool.push(...q.get_all(team_size));
                
                // sort once again
                potential_pool.sort((p1, p2) => p1.mmr - p2.mmr);
                
                // if (potential_pool.length > 0)
                //     trace('pp', potential_pool.map(t => (t.by as Client).name));
                
                
                // define the pool of players/parties with close enough mmr for the match
                let players_needed = team_size * teams_count;
                let max_mmr_diff = global.config.matchmaking.mmr_max_difference;
                let best_diff = Number.MAX_SAFE_INTEGER;
                
                // modified "sliding window"
                for (let left = 0; left < potential_pool.length; left++) {
                    let p1 = potential_pool[left];
                    let player_count = p1.party_size;
                    
                    let temp_pool = [p1];
                    
                    for (let right = left + 1; right < potential_pool.length; right++) {
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
                                pool = [].concat(...temp_pool); // make a copy
                            }
                            break;
                        }
                    }
                }
                
                if (pool.length > 0)
                    trace('pool', pool.map(t => t.by.name));
                
                // not enough players for a match
                if (pool.length == 0) {
                    match_found = false;
                    break; // immediately skip to the next mode
                }
                
                
                let idx = 0; // the current index of a team to be filled
                
                // go backwards to distribute highest mmr players first
                for (let i = pool.length - 1; i >= 0; i--) {
                    let ticket = pool[i]; // party ticket
                    
                    if (ticket.party_size == team_size) { // it's a full party
                        // find an empty team
                        idx = teams_filled.findIndex(n => n === 0);
                    }
                    else { // it's a single player
                        
                        // add the highest mmr player to the current lowest mmr team
                        // get the index of a non-filled team with the lowest mmr
                        idx = teams_mmr.reduce((idx, mmr, i) => ((teams_filled[i] < team_size) && (idx == -1 || mmr < teams_mmr[idx])) ? i : idx, -1);
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
                for (let party_size = team_size; party_size > 0; party_size--) {
                    let j = 0;
                    // for each team
                    for (let i = 0; i < teams_count; i++) {
                        // while the i'th team can fit a party of party_size - add one
                        while (teams_filled[i] + party_size <= team_size) {
                            // no more unused parties left of party_size - go to the next party size
                            if (j >= q.count(party_size))
                                break;
                            
                            let party = q.get(party_size, j);
                            
                            teams[i].push(party);
                            teams_filled[i] += party_size;
                            teams_mmr[i] += party.avg_mmr * party_size;
                            j++;
                        }
                        
                        // if (j >= q.count(party_size))
                        //     break;
                    }
                }
            }
            
            // if (teams.flat().length > 0)
            //     trace('teams:', teams);
            
            // check if all the teams are packed
            for (let i = 0; i < teams_count; i++) {
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
            for (let i = 0; i < teams_count; i++) {
                for (let j = 0; j < teams[i].length; j++) {
                    let ticket = teams[i][j];
                    q.remove(ticket);
                }
            }
            
            trace('match made! teams:', teams.map(team => team.map(t => `${t.by.name} (${t.mmr} mmr)`)));
            
            // create an instance of Match
            let match = new Match(mode, teams);
            
            // the rest (sending, etc.) is handled in the Match() constructor
        }
    }
    
    static canCreateTicket(by, req) {
        let party_size = by instanceof Party ? by.members.length : 1;
        let game_mode = gameModeFind(req.game_mode);
        
        // don't allow parties bigger than team size
        if (party_size > game_mode.team_size) {
            return false;
        }
        
        // ranked game modes currently only allow full parties and single players
        let is_full_party = party_size == game_mode.team_size;
        let is_single_player = party_size == 1;
        
        if (game_mode.ranked && !is_full_party && !is_single_player) {
            return false;
        }
        
        
        // don't allow players who aren't logged in into ranked
        let logged_in_party = by instanceof Party && !by.members.some(m => !m.logged_in);
        let logged_in_player = by instanceof Client && by.logged_in;
        
        if (game_mode.ranked && !(logged_in_party || logged_in_player)) {
            return false;
        }
        
        // add your conditions here
        
        
        return true;
    }
    
    static createTicket(by, req) {
        if (!this.canCreateTicket(by, req)) {
            return null;
        }
        
        let t;
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
    static findNonfullLobby(user) {
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
    static getMMRDelta(player_mmr, opponent_mmr, result) {
        // win = 1, loss = 0, draw = 0.5
        let res;
        switch (result) {
            case 'win':
                res = 1;
                break;
            case 'loss':
                res = 0;
                break;
            case 'draw':
                res = .5;
                break;
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
