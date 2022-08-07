import trace from '#util/logging';
import Point from '#types/point';
import LoadRoom from '#util/load_room';

export enum GAME_MODE {
    MMO = "mmo",
    PVP = "pvp"
}

type MapData = {
    name: string,
    room_name: string,
    description?: string,

    width: number,
    height: number,

    // content_string: string, // .yy room?

    mode: 'mmo' | 'pvp',
    start_pos: Point|Point[],
    max_players?: number
}

export type MapInfo = {
    name: string,
    room_name: string,
    description?: string,

    mode: 'mmo' | 'pvp',
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

    mode:GAME_MODE = GAME_MODE.MMO; // either 'mmo' or 'pvp'
    start_pos:Point[]|Point = [{x: 0, y: 0}]; // if 'mmo', it picks a random starting pos, otherwise - in order

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
            switch(this.mode) {
                case 'mmo':
                    // a random number between 0 and start_pos.length
                    var index = Math.round(Math.random() * (this.start_pos.length - 1));
                    return this.start_pos[index];
                case 'pvp':
                    // just index clamped to start_pos.length
                    var index = idx % this.start_pos.length;
                    return this.start_pos[index];
                default:
                    console.error('Error: Invalid map mode');
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
            mode: this.mode,
            max_players: this.max_players,
            start_pos: this.start_pos
        }
    }
}