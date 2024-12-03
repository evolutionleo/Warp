import SendStuff from '#cmd/sendStuff';
import Lobby from '#concepts/lobby';
import { lobbyList } from '#concepts/lobby';

declare module '#cmd/sendStuff' {
    interface SendStuff {
        sendLobbyJoin(lobby:Lobby):void
        sendLobbyReject(lobby:Lobby, reason?:string):void
        sendLobbyLeave(lobby:Lobby, reason?:string, forced?:boolean):void
        sendLobbyUpdate(lobby: Lobby):void
        sendLobbyInfo(lobby_id: string):void
        sendLobbyList():void
    }
}

/**
 * @param {Lobby} lobby 
 */
SendStuff.prototype.sendLobbyJoin = function(lobby:Lobby) {
    this.send({ cmd: 'lobby join', lobby: lobby.getInfo() });
}

/**
 * @param {Lobby} lobby 
 * @param {string} [reason='']
 */
SendStuff.prototype.sendLobbyReject = function(lobby:Lobby, reason:string = '') {
    this.send({ cmd: 'lobby reject', lobby: lobby.getInfo(), reason: reason });
}

/**
 * @param {Lobby} lobby 
 * @param {string} [reason=''] 
 * @param {boolean} [forced=true]
 */
SendStuff.prototype.sendLobbyLeave = function(lobby:Lobby, reason:string = '', forced:boolean = true) {
    this.send({ cmd: 'lobby leave', lobby: lobby.getInfo(), reason: reason, forced: forced });
}

/**
 * @param {Lobby} lobby 
 */
SendStuff.prototype.sendLobbyUpdate = function(lobby:Lobby) { // some data changed
    this.send({ cmd: 'lobby update', lobby: lobby.getInfo() });
}

SendStuff.prototype.sendLobbyList = function() {
    this.send({ cmd: 'lobby list', lobbies: lobbyList().map(lobby => lobby.getInfo()) }); // lobbies as an array
}

/**
 * @param {string} lobby_id 
 */
SendStuff.prototype.sendLobbyInfo = function(lobby_id:string) {
    this.send({ cmd: 'lobby info', lobby: global.lobbies[lobby_id].getInfo()})
}