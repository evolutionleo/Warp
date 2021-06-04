const fs = require('fs');
const path = require('path');

// this file isn't really meant to be touched, all you have to know is that
// basically all this does is just loading all the maps from the 'maps/' folder, that globals.maps is then set to

// __dirname is where this file is located
const maps_dir = path.join(__dirname, '/../../maps/');
global.maps = [];
const filenames = fs.readdirSync(maps_dir); // sync because CommonJS

filenames.forEach((filename) => {        // basically (a, b) => {} is equivallent to function(a, b) {}
    var this_map = require(maps_dir + filename);
    maps.push(this_map);
})