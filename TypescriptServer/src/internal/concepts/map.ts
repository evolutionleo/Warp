import trace from '#util/logging';
import Point from '#types/point';
import LoadRoom from '#util/load_room';


// random - everyone is spawned at one of the spawn points at random
// distributed - each player will spawn at a different point (if possible)
export type SPAWN_TYPE = 'random' | 'distributed';
/**
 * @enum {string}
 */
export const GAME_MODES = {
    
};

export type MapData = {
    name: string,
    room_name: string,
    description?: string,

    width: number,
    height: number,

    // content_string: string, // .yy room?

    spawn_type: SPAWN_TYPE,
    start_pos: Point|Point[],
    max_players?: number
}

export type MapInfo = {
    name: string,
    room_name: string,
    description?: string,

    spawn_type: SPAWN_TYPE,
    start_pos: Point|Point[],
    max_players?: number
}

// Map is a blueprint for a room
export default class GameMap { // represents a game map
    name:string = ''; // map's display name
    room_name:string = ''; // room name in GMS2
    description:string = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit';
    preview:string = ''; // maybe implement preview images
    max_players:number = 99;

    width:number = 1344;
    height:number = 768;

    spawn_type:SPAWN_TYPE = 'random'; // either 'random' or 'distributed'
    start_pos:Point[]|Point = [{x: 0, y: 0}]; // if 'random', it picks a random starting pos for everyone, otherwise - goes in order from 0 to *length*

    contents = '[]';
    // content: string; // a JSON string containing all the contents of the room

    constructor(options:MapData) {
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
                    console.error('Error: Invalid map type');
                    return undefined;
            }
        }
        else { // it's a single object
            return this.start_pos;
        }
    }

    getInfo():MapInfo {
        return {
            name: this.name,
            room_name: this.room_name,
            description: this.description,
            spawn_type: this.spawn_type,
            max_players: this.max_players,
            start_pos: this.start_pos
        }
    }
}