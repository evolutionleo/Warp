const Lobby = require('./concepts/lobby.js');
const crypto = require('crypto');
const Map = require('./concepts/map.js');

/**
 * Creates a new lobby with the selected map
 * @param {string|Map} map_name 
 * @returns {Lobby} lobby
 */
module.exports.createLobby = function(map_name) { // returns the lobby instance
    var lobby = new Lobby(map_name);

    while(true) {
        // a random 6-digit number
        var lobbyid = crypto.randomInt(100000, 999999).toString();
        if (lobbyid in global.lobbies) {
            continue;
        }
        else {
            global.lobbies[lobbyid] = lobby;
            lobby.lobbyid = lobbyid;
            break;
        }
    }
    
    return lobby;
}

/**
 * Finds a lobby by id
 * @param {string} lobbyid 
 * @returns {Lobby}
 */
module.exports.findLobby = function(lobbyid) {
    // changed the implementation to objects/structs instead of arrays
    return global.lobbies[lobbyid];
}

/**
 * Deletes a lobby by id
 * @param {string} lobbyid 
 */
module.exports.deleteLobby = function(lobbyid) {
    var lobby = global.lobbies[lobbyid];
    lobby.close();

    delete global.lobbies[lobbyid];
}