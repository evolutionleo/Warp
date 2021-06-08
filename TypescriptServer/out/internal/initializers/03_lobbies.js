import { createLobby } from '#internal/lobbyFunctions';
// create a lobby for each map
global.maps.forEach(function (map) {
    createLobby(map);
});
for (var i = 0; i < 3; i++) {
    createLobby('Test Map');
}
