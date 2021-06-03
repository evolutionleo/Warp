const fs = require('fs');

// this file isn't really meant to be touched, all you have to know is that
// basically all this does is just loading all the maps from the 'maps/' folder, that globals.maps is then set to

const maps_dir = __dirname + '/../maps/';
global.maps = [];
const filenames = fs.readdirSync(maps_dir); // sync because CommonJS

filenames.forEach((filename) => {        // basically (a, b) => {} is equivallent to function(a, b) {}
    var this_map = require(maps_dir + filename);
    maps.push(this_map);
})