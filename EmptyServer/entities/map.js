module.exports = class Map { // represents a game map
    name = ''; // map's display name
    room_name = ''; // room name in GMS2
    description = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit';
    preview = ''; // maybe implement preview images

    mode = 'mmo'; // 'mmo' or 'pvp'
    start_pos = [{x: 0, y: 0}]; // if 'mmo', it picks a random starting pos, otherwise - in order
    
    constructor(options) {
        Object.assign(this, options);
    }

    getStartPos(idx) {
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