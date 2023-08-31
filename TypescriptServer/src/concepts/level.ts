import trace from '#util/logging';
import Point from '#types/point';
import LoadRoom from '#util/load_room';


export function levelFind(name: string) {
    return global.levels[name];
}

export function levelGetList() {
    return global.levels;
}


// random - everyone is spawned at one of the spawn points at random
// distributed - each player will spawn at a different point (if possible)
export type SPAWN_TYPE = 'random' | 'distributed';

export type LevelDef = {
    name: string,
    room_name: string,
    description?: string,

    width?: number,
    height?: number,

    game_mode?: string,

    // content_string: string, // .yy room?

    spawn_type: SPAWN_TYPE,
    start_pos: Point|Point[]
}

export type LevelInfo = {
    name: string,
    description?: string,

    game_mode?:string,
    max_players?: number,

    room_name: string,
    spawn_type: SPAWN_TYPE,
    start_pos: Point|Point[]
}


// a Level is a blueprint for a room
export default class GameLevel { // represents a game map
    name:string = ''; // level's display name
    room_name:string = ''; // room name in GMS2

    game_mode:string = '';

    width:number = 1344;
    height:number = 768;

    spawn_type:SPAWN_TYPE = 'random'; // either 'random' or 'distributed'
    start_pos:Point[]|Point = [{x: 0, y: 0}]; // if 'random', it picks a random starting pos for everyone, otherwise - goes in order from 0 to *length*

    contents:string = '[]'; // a JSON string containing all the contents of the room

    constructor(options:LevelDef) {
        Object.assign(this, options);
        if (global.config.rooms_enabled) {
            Object.assign(this, LoadRoom(this.room_name));
        }

        // trace(this.contents);
    }

    getStartPos(idx:number):Point {
        if (Array.isArray(this.start_pos)) { // it's an array of positions
            switch(this.spawn_type) {
                case 'random':
                    // a random number between 0 and start_pos.length
                    var index = Math.round(Math.random() * (this.start_pos.length - 1));
                    return this.start_pos[index];
                case 'distributed':
                    // just index clamped to start_pos.length
                    var index = idx % this.start_pos.length;
                    return this.start_pos[index];
                default:
                    console.error('Error: Invalid level type');
                    return undefined;
            }
        }
        else { // it's a single object
            return this.start_pos;
        }
    }

    getInfo():LevelInfo {
        return {
            name: this.name,
            room_name: this.room_name,
            spawn_type: this.spawn_type,
            start_pos: this.start_pos
        }
    }
}