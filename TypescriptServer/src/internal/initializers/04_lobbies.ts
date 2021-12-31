import { createLobby } from '#util/lobby_functions';

for(var i = 0; i < global.config.initial_lobbies; i++) {
    createLobby();
}