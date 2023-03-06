import { lobbyCreate } from '#concepts/lobby';

for (var i = 0; i < global.config.initial_lobbies; i++) {
    lobbyCreate();
}
