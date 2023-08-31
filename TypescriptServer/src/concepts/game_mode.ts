import GameLevel from "./level";
import GameMap from "./map";

export function gameModeExists(name:string) {
    return global.game_modes[name] !== undefined;
}

export function gameModeGet(name:string):GameMode {
    return global.game_modes[name];
}

export type GameModeDef = {
    name: string;
    ranked?: boolean;
    
    max_players?: number;

    teams_enabled?: boolean;
    team_size?: number;
    teams?: number;
}


export class GameMode {
    name: string;

    ranked: boolean = false;

    teams_enabled: boolean = true;
    team_size: number = 1;
    teams: number = 2;
    
    max_players: number = -1;

    maps: GameMap[] = []; // defined automatically from level defs

    constructor(props: GameModeDef) {
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