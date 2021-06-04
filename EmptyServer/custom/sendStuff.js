const packet = require('./../internal/packet.js');

module.exports = class SendStuff {
    constructor() {}

    // basic send
    write(data) {
        this.socket.write(packet.build(data));
    }

    send(data) { // just another name
        return this.write(data);
    }
    
    // different types of broadcast
    broadcastList(clients, pack, notme) {
        if (notme) {
            notme = true;
        }

        clients.forEach(function(c) {
            if (c === this && notme) {}
            else {
                c.write(pack);
            }
        });
    }

    broadcastAll(pack, notme) {
        return broadcastList(clients, pack, notme);
    }

    broadcastLobby(pack, notme) {
        if (this.lobby === null)
            return -1

        return broadcastList(this.lobby.players, pack, notme);
    }
    
    // these functions can be later called using %insert_client%.sendThing()
    // in handlePacket.js or wherever else where you have client objects
    sendHello() {
        this.write({cmd: 'hello', str: 'Hello, client!'})
        this.write({cmd: 'hello2', str: 'Hello again, client!'})
    }

    sendMessage(msg) {
        this.write({cmd: 'message', msg: msg})
    }

    // these are some preset functions

    sendRegister(status, reason) {
        if (!reason)
            reason = '';
        this.write({cmd: 'register', status: status, reason: reason});
    }

    sendLogin(status, reason) {
        if (!reason)
            reason = '';
        this.write({cmd: 'login', status: status, reason: reason, account: this.account, profile: this.profile});
    }

    sendJoinLobby(lobby) {
        this.write({ cmd: 'lobby join', lobby: lobby.serialize() });
    }

    sendRejectLobby(lobby, reason) {
        if (!reason)
            reason = '';
        this.write({ cmd: 'lobby reject', lobby: lobby.serialize(), reason: reason });
    }

    sendKickLobby(lobby, reason, forced) {
        if (!forced)
            forced = true;
        if (!reason)
            reason = '';
        this.write({ cmd: 'lobby leave', lobby: lobby.serialize(), reason: reason, forced: forced });
    }

    sendUpdateLobby(lobby) { // some data changed
        this.write({ cmd: 'lobby update', lobby: lobby.serialize() });
    }

    sendLobbyList() {
        this.write({ cmd: 'lobby list', lobbies: Object.values(global.lobbies).map(lobby => lobby.serialize()) }); // lobbies as an array
    }

    sendPlay(lobby, start_pos) {
        this.write({ cmd: 'play', lobby: lobby.serialize(), start_pos: start_pos });
    }

    // #################################
    // You can write your wrappers here:
}