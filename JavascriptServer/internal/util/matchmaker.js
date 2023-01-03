
export default class MatchMaker {
    static queue = [];
    static _interval = null;
    
    // an internal loop
    static process_matches() {
        
    }
    
    /**
     * picks the first non-full lobby and returns it
     * @param {Client} user
     * @returns {Lobby} lobby
     */
    static find_nonfull_lobby(user) {
        var match_lobby = null;
        // this a so called 'arrow function'.
        // (lobby) => {} is the same as function(lobby) {}
        Object.values(global.lobbies).forEach((lobby) => {
            // you can add additional checks for user rank, etc.
            // and your own matchmaking logic
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
    static get_mmr_delta(player_mmr, opponent_mmr, result) {
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
        
        const k = 100; // maximum possible gain/loss, when the weakest player wins against the best
        const mmr_scale = 800; // the bigger the number, the less the result changes with mmr difference. (e.x. chess uses 400, making a huge difference from even 200 mmr/elo)
        
        const percent = (player_mmr + opponent_mmr) / player_mmr;
        const transformed_mmr1 = 10 ** (player_mmr / mmr_scale);
        const transformed_mmr2 = 10 ** (opponent_mmr / mmr_scale);
        
        const expected_result = transformed_mmr1 / (transformed_mmr1 + transformed_mmr2);
        
        return Math.round(k * (res - expected_result));
    }
}
