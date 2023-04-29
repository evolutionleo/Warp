import SendStuff from '#cmd/sendStuff';
import { lobbyList } from '#concepts/lobby';

/**
 * @param {Lobby} lobby
 */
SendStuff.prototype.sendLobbyJoin = function (lobby) {
    this.send({ cmd: 'lobby join', lobby: lobby.getInfo() });
};

/**
 * @param {Lobby} lobby
 * @param {string} [reason='']
 */
SendStuff.prototype.sendLobbyReject = function (lobby, reason = '') {
    this.send({ cmd: 'lobby reject', lobby: lobby.getInfo(), reason: reason });
};

/**
 * @param {Lobby} lobby
 * @param {string} [reason='']
 * @param {boolean} [forced=true]
 */
SendStuff.prototype.sendLobbyLeave = function (lobby, reason = '', forced = true) {
    this.send({ cmd: 'lobby leave', lobby: lobby.getInfo(), reason: reason, forced: forced });
};

/**
 * @param {Lobby} lobby
 */
SendStuff.prototype.sendLobbyUpdate = function (lobby) {
    this.send({ cmd: 'lobby update', lobby: lobby.getInfo() });
};

SendStuff.prototype.sendLobbyList = function () {
    this.send({ cmd: 'lobby list', lobbies: lobbyList().map(lobby => lobby.getInfo()) }); // lobbies as an array
};

/**
 * @param {string} lobbyid
 */
SendStuff.prototype.sendLobbyInfo = function (lobbyid) {
    this.send({ cmd: 'lobby info', lobby: global.lobbies[lobbyid].getInfo() });
};
