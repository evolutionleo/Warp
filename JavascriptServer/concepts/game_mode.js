
export function gameModeExists(name) {
    return global.game_modes[name] !== undefined;
}

export function gameModeFind(name) {
    return global.game_modes[name];
}


export class GameMode {
    name;
    
    ranked = false;
    
    teams_enabled = true;
    team_size = 1;
    teams = 2;
    
    max_players = -1;
    
    maps = []; // defined automatically from level defs
    
    constructor(props) {
        Object.assign(this, props);
        
        if (!this.teams_enabled) {
            this.teams = this.max_players;
            this.team_size = 1;
        }
        else if (this.max_players == -1) {
            // players total
            this.max_players = this.teams * this.team_size;
        }
    }
}

export default GameMode;
