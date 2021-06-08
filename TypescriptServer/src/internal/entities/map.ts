enum GAME_MODE {
    MMO = "mmo",
    PVP = "pvp"
}

type Point = {
    x: number,
    y: number
}

export default class GameMap { // represents a game map
    name:string = ''; // map's display name
    room_name:string = ''; // room name in GMS2
    description:string = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit';
    preview:string = ''; // maybe implement preview images

    mode:GAME_MODE = GAME_MODE.MMO; // 'mmo' or 'pvp'
    start_pos:Point[]|Point = [{x: 0, y: 0}]; // if 'mmo', it picks a random starting pos, otherwise - in order
    
    constructor(options:object) {
        Object.assign(this, options);
    }

    getStartPos(idx:number):Point {
        if (Array.isArray(this.start_pos)) { // it's an array of positions
            switch(this.mode) {
                case 'mmo':
                    // a random number between 0 and start_pos.length
                    var index = Math.round(Math.random() * this.start_pos.length);
                    return this.start_pos[index];
                case 'pvp':
                    // just index clamped to start_pos.length
                    var index = idx % this.start_pos.length;
                    return this.start_pos[index];
                default:
                    console.log('Error: Invalid map mode');
                    return undefined;
            }
        }
        else { // it's a single object
            return this.start_pos;
        }
    }
}