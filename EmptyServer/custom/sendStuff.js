const packet = require('./../internal/packet.js');
const ws = require('ws');
const net = require('net');


// console.log(Object.keys(packet));
console.log(packet);


/**
 * @property {string} type
 * @property {ws|net.Socket} socket
 */
module.exports = class SendStuff {
    type; // 'ws' / 'tcp'
    socket; // WebSocket or net.Socket

    /**
     * 
     * @param {ws|net.Socket} socket
     * @param {string} type
     */
    constructor(socket, type) {
        this.socket = socket;
        this.type = type.toLowerCase();
    }

    /** 
     * basic send
     * @param {Object} data 
     */
    write(data) {
        console.log(Object.keys(packet));

        if (this.type === 'ws') {
            this.socket.send(packet.ws_build(data));
        }
        else {
            this.socket.send(packet.build(data));
        }
    }

    /**
     * same as .write()
     * @param {Object} data 
     */
    send(data) { // just another name
        return this.write(data);
    }
    
    // different types of broadcast
    /**
     * 
     * @param {any[]} clients 
     * @param {Object} pack 
     * @param {boolean} [notme=true] 
     */
    broadcastList(clients, pack, notme = true) {
        var client = this;

        clients.forEach(function(c) {
            if (c === client && notme) {}
            else {
                c.write(pack);
            }
        });
    }

    /**
     * @param {Object} pack 
     * @param {boolean} [notme=true] 
     */
    broadcastAll(pack, notme) {
        return this.broadcastList(global.clients, pack, notme);
    }

    /**
     * @param {Object} pack 
     * @param {boolean} [notme=true]
     */
    broadcastLobby(pack, notme) {
        if (this.lobby === null)
            return -1

        return this.broadcastList(this.lobby.players, pack, notme);
    }
    
    // !!!
    // these functions can be later called using some_client.sendThing()
    // in handlePacket.js or wherever else where you have client objects
    // !!!
    sendHello() {
        this.write({cmd: 'hello', str: 'Hello, client!'});
        // this.write({cmd: 'hello2', str: 'Hello again, client!'});
    }

    /**
     * @param {string} msg 
     */
    sendMessage(msg) {
        this.write({cmd: 'message', msg: msg});
    }



    // these are some preset functions
    /**
     * @param {string} status 
     * @param {string} [reason='']
     */
    sendRegister(status, reason = '') {
        this.write({cmd: 'register', status: status, reason: reason});
    }

    /**
     * 
     * @param {string} status 
     * @param {string} [reason=''] 
     */
    sendLogin(status, reason = '') {
        this.write({cmd: 'login', status: status, reason: reason, account: this.account, profile: this.profile});
    }

    /**
     * 
     * @param {Lobby} lobby 
     */
    sendJoinLobby(lobby) {
        this.write({ cmd: 'lobby join', lobby: lobby.serialize() });
    }

    /**
     * 
     * @param {Lobby} lobby 
     * @param {string} [reason='']
     */
    sendRejectLobby(lobby, reason = '') {
        this.write({ cmd: 'lobby reject', lobby: lobby.serialize(), reason: reason });
    }

    /**
     * 
     * @param {Lobby} lobby 
     * @param {string} [reason=''] 
     * @param {boolean} [forced=true]
     */
    sendKickLobby(lobby, reason = '', forced = true) {
        this.write({ cmd: 'lobby leave', lobby: lobby.serialize(), reason: reason, forced: forced });
    }

    /**
     * 
     * @param {Lobby} lobby 
     */
    sendUpdateLobby(lobby) { // some data changed
        this.write({ cmd: 'lobby update', lobby: lobby.serialize() });
    }

    sendLobbyList() {
        this.write({ cmd: 'lobby list', lobbies: Object.values(global.lobbies).map(lobby => lobby.serialize()) }); // lobbies as an array
    }

    /**
     * 
     * @param {string} lobbyid 
     */
    sendLobbyInfo(lobbyid) {
        this.write({ cmd: 'lobby info', lobby: global.lobbies[lobbyid].serialize()})
    }

    /**
     * 
     * @param {Lobby} lobby 
     * @param {Point} start_pos 
     */
    sendPlay(lobby, start_pos) {
        this.write({ cmd: 'play', lobby: lobby.serialize(), start_pos: start_pos });
    }


    // #################################
    // You can write your wrappers here:

}