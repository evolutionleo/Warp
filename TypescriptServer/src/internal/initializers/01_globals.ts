global.clients = [];
global.maps = [];           // loaded in 02_maps.js
if (global.config.entities_enabled) {
    global.entities = [];       // loaded in 03_entities.js
    global.entityNames = {};
    global.entityObjects = {};
}
global.lobbies = {};        // loaded in 04_lobbies.js 
global.parties = {};

export {}