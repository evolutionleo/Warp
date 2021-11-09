export var GAME_MODE;
(function (GAME_MODE) {
    GAME_MODE["MMO"] = "mmo";
    GAME_MODE["PVP"] = "pvp";
})(GAME_MODE || (GAME_MODE = {}));
import LoadRoom from '#util/load_room';
// Map is a blueprint for a room
export default class GameMap {
    // content: string; // a JSON string containing all the contents of the room
    constructor(options) {
        this.name = ''; // map's display name
        this.room_name = ''; // room name in GMS2
        this.description = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit';
        this.preview = ''; // maybe implement preview images
        this.max_players = 99;
        this.width = 1344;
        this.height = 768;
        this.mode = GAME_MODE.MMO; // either 'mmo' or 'pvp'
        this.start_pos = [{ x: 0, y: 0 }]; // if 'mmo', it picks a random starting pos, otherwise - in order
        this.contents = '[]';
        Object.assign(this, options);
        Object.assign(this, LoadRoom('./rooms/' + this.room_name + '.yy'));
        // console.log(this.contents);
    }
    getStartPos(idx) {
        if (Array.isArray(this.start_pos)) { // it's an array of positions
            switch (this.mode) {
                case 'mmo':
                    // a random number between 0 and start_pos.length
                    var index = Math.round(Math.random() * this.start_pos.length);
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
}
