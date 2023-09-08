import { addHandler } from "#cmd/handlePacket";
import { lobbyExists } from "#concepts/lobby";


addHandler('lobby list', (c) => {
    c.sendLobbyList();
});

addHandler('lobby info', (c, data) => {
    var lobbyid = data.lobbyid;
    if (lobbyExists(lobbyid))
        c.sendLobbyInfo(lobbyid);
});

addHandler('lobby join', (c, data) => {
    if (!global.config.lobby.allow_join_by_id)
        return;
    
    var lobbyid = data.lobbyid;
    if (lobbyExists(lobbyid))
        c.lobbyJoin(lobbyid);
});

addHandler('lobby leave', (c, data) => {
    var lobby = c.lobby;
    if (lobby !== null) {
        lobby.kickPlayer(c, 'you left the lobby', false);
    }
});
