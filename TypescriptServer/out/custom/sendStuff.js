import packet from '#internal/packet';
export default class SendStuff {
    constructor() { }
    // basic send
    write(data) {
        return this.socket.write(packet.build(data));
    }
    send(data) {
        return this.write(data);
    }
    // different types of broadcast
    broadcastList(clients, pack, notme = true) {
        clients.forEach(function (c) {
            if (c === this && notme) { }
            else {
                c.write(pack);
            }
        });
    }
    broadcastAll(pack, notme) {
        return this.broadcastList(global.clients, pack, notme);
    }
    broadcastLobby(pack, notme) {
        if (this.lobby === null)
            return -1;
        return this.broadcastList(this.lobby.players, pack, notme);
    }
    broadcastRoom(pack, notme) {
        if (this.room === null)
            return -1;
        return this.broadcastList(this.room.players, pack, notme);
    }
    // these functions can be later called using %insert_client%.sendThing()
    // in handlePacket.js or wherever else where you have client objects
    sendHello() {
        this.write({ cmd: 'hello', str: 'Hello, client!' });
        this.write({ cmd: 'hello2', str: 'Hello again, client!' });
    }
    sendMessage(msg) {
        this.write({ cmd: 'message', msg: msg });
    }
    // these are some preset functions
    sendRegister(status, reason = '') {
        this.write({ cmd: 'register', status: status, reason: reason });
    }
    sendLogin(status, reason = '') {
        this.write({ cmd: 'login', status: status, reason: reason, account: this.account?.toJSON(), profile: this.profile?.toJSON() });
    }
    sendJoinLobby(lobby) {
        this.write({ cmd: 'lobby join', lobby: lobby.serialize() });
    }
    sendRejectLobby(lobby, reason = '') {
        this.write({ cmd: 'lobby reject', lobby: lobby.serialize(), reason: reason });
    }
    sendKickLobby(lobby, reason = '', forced = true) {
        this.write({ cmd: 'lobby leave', lobby: lobby.serialize(), reason: reason, forced: forced });
    }
    sendUpdateLobby(lobby) {
        this.write({ cmd: 'lobby update', lobby: lobby.serialize() });
    }
    sendLobbyList() {
        this.write({ cmd: 'lobby list', lobbies: Object.values(global.lobbies).map(lobby => lobby.serialize()) }); // lobbies as an array
    }
    sendLobbyInfo(lobbyid) {
        this.write({ cmd: 'lobby info', lobby: global.lobbies[lobbyid].serialize() });
    }
    sendPlay(lobby, room, start_pos) {
        this.write({ cmd: 'play', room: room.serialize(), lobby: lobby.serialize(), start_pos: start_pos });
        console.log('sent the Play command');
    }
}
