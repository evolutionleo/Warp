import GameLevel, { LevelInfo, levelFind } from "#concepts/level";

export function mapFind(name:string) {
    return global.maps.find(m => m.name === name);
}

export function mapExists(name:string) {
    return global.maps.some(m => m.name === name);
}

export type MapDef = {
    name: string,
    description?: string,
    game_mode: string,
    levels: string[]
}

export type MapInfo = {
    name: string,
    game_mode: string,
    levels: LevelInfo[]
}

export type GameMapInfo = {
    name: string,
    game_mode: string,
    levels: string[]
}

export default class GameMap {
    name: string = 'unknown';
    game_mode: string = 'unknown';
    levels: GameLevel[] = [];
    description:string = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit';

    constructor(data: MapDef|GameLevel) {
        if (data instanceof GameLevel) { // using the constructor to create a map from a single level
            let level = data;

            this.name = level.name;
            this.game_mode = level.game_mode ?? this.game_mode;
            this.levels = [level];
        }
        else { // creating from a proper definition
            Object.assign(this, data);
    
            let _levels = this.levels as unknown as string[];
            this.levels = _levels.map(level_name => levelFind(level_name));
        }
    }

    getInfo() {
        return {
            name: this.name,
            description: this.description,
            game_mode: this.game_mode,
            levels: this.levels.map(l => l.name)
        }
    }
}