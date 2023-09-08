import GameLevel, { levelFind } from "#concepts/level";

export function mapFind(name) {
    return global.maps.find(m => m.name === name);
}

export function mapExists(name) {
    return global.maps.some(m => m.name === name);
}

export default class GameMap {
    name = 'unknown';
    game_mode = 'unknown';
    levels = [];
    description = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit';
    constructor(data, game_mode) {
        if (data === null || data === undefined) {
            throw 'Trying to create a map from a null/undefined definition';
        }
        else if (data instanceof GameLevel) { // using the constructor to create a map from a single level
            let level = data;
            
            this.name = level.name;
            this.game_mode = game_mode ?? this.game_mode;
            this.levels = [level];
        }
        else { // creating from a proper definition
            Object.assign(this, data);
            
            let _levels = this.levels;
            this.levels = _levels.map(level_name => levelFind(level_name));
        }
    }
    
    getInfo() {
        return {
            name: this.name,
            description: this.description,
            game_mode: this.game_mode,
            levels: this.levels.map(l => l.name)
        };
    }
}
