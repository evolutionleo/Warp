import { addHandler } from "#cmd/handlePacket";
import Lobby, { lobbyExists } from "#concepts/lobby";


addHandler('lobby list', (c) => {
    c.sendLobbyList();
});

addHandler('lobby info', (c, data) => {
    const lobby_id = data.lobby_id;
    if (lobbyExists(lobby_id))
        c.sendLobbyInfo(lobby_id);
});

addHandler('lobby join', (c, data) => {
    if (!global.config.lobby.allow_join_by_id)
        return;

    const lobby_id = data.lobby_id;
    if (lobbyExists(lobby_id))
        c.lobbyJoin(lobby_id);
});

addHandler('lobby leave', (c, data) => {
    let lobby:Lobby = c.lobby;
    if (lobby !== null) {
        lobby.kickPlayer(c, 'you left the lobby', false);
    }
});