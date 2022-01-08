import packet from '#internal/packet';
// import ClientProperties from '#types/clientProperties';


export default class SendStuff {
    socket;
    type;
    
    lobby;
    room;
    
    account;
    profile;
    
    halfpack; // used internally in packet.ts
    
    entity;
    
    
    /**
     *
     * @param {Sock} socket
     * @param {string} type
     */
    constructor(socket, type) {
        this.socket = socket;
        this.type = type.toLowerCase();
    }
    
    
    /**
     * basic send
     * @param {object} data
     */
    write(data) {
        // console.log(Object.keys(packet));
        
        if (this.type === 'ws') {
            this.socket.send(packet.ws_build(data));
        }
        else {
            this.socket.write(packet.build(data));
        }
    }
    
    /**
     * same as .write()
     * @param {object} data
     */
    send(data) {
        return this.write(data);
    }
    
    // different types of broadcast
    /**
     *
     * @param {any[]} clients
     * @param {object} pack
     * @param {boolean} [notme=true]
     */
    broadcastList(clients, pack, notme = true) {
        clients.forEach(function (c) {
            if (c === this && notme) { }
            else {
                c.write(pack);
            }
        });
    }
    
    /**
     * @param {object} pack
     * @param {boolean} [notme=true]
     */
    broadcastAll(pack, notme) {
        return this.broadcastList(global.clients, pack, notme);
    }
    
    /**
     * @param {object} pack
     * @param {boolean} [notme=true]
     */
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
    
    // !!!
    // these functions can be later called using some_client.sendThing()
    // in handlePacket.js or wherever else where you have client objects
    // !!!
    sendHello() {
        this.send({ cmd: 'hello', str: 'Hello, client!' });
        this.send({ cmd: 'hello2', str: 'Hello again, client!' });
    }
    
    /**
     * @param {string} msg
     */
    sendMessage(msg) {
        this.send({ cmd: 'message', msg });
    }
    
    
    sendPing() {
        let t = new Date().getTime();
        this.send({ cmd: 'ping', t });
    }
    
    /**
     *
     * @param {number} t
     */
    sendPong(t) {
        this.send({ cmd: 'pong', t });
    }
    
    
    // these are some preset functions
    /**
     * @param {string} status
     * @param {string} [reason='']
     */
    sendRegister(status, reason = '') {
        this.send({ cmd: 'register', status: status, reason: reason });
    }
    
    /**
     *
     * @param {string} status
     * @param {string} [reason='']
     */
    sendLogin(status, reason = '') {
        this.send({ cmd: 'login', status: status, reason: reason, account: this.account?.toJSON(), profile: this.profile?.toJSON() });
    }
    
    /**
     *
     * @param {Lobby} lobby
     */
    sendJoinLobby(lobby) {
        this.send({ cmd: 'lobby join', lobby: lobby.getInfo() });
    }
    
    /**
     *
     * @param {Lobby} lobby
     * @param {string} [reason='']
     */
    sendRejectLobby(lobby, reason = '') {
        this.send({ cmd: 'lobby reject', lobby: lobby.getInfo(), reason: reason });
    }
    
    /**
     *
     * @param {Lobby} lobby
     * @param {string} [reason='']
     * @param {boolean} [forced=true]
     */
    sendKickLobby(lobby, reason = '', forced = true) {
        this.send({ cmd: 'lobby leave', lobby: lobby.getInfo(), reason: reason, forced: forced });
    }
    
    /**
     *
     * @param {Lobby} lobby
     */
    sendUpdateLobby(lobby) {
        this.send({ cmd: 'lobby update', lobby: lobby.getInfo() });
    }
    
    sendLobbyList() {
        this.send({ cmd: 'lobby list', lobbies: Object.values(global.lobbies).map(lobby => lobby.getInfo()) }); // lobbies as an array
    }
    
    /**
     *
     * @param {string} lobbyid
     */
    sendLobbyInfo(lobbyid) {
        this.send({ cmd: 'lobby info', lobby: global.lobbies[lobbyid].getInfo() });
    }
    
    /**
     *
     * @param {Lobby} lobby
     * @param {Room} room
     * @param {Point} start_pos
     * @param {string} [uuid=undefined]
     */
    sendPlay(lobby, room, start_pos, uuid) {
        this.send({ cmd: 'play', room: room.serialize(), lobby: lobby.getInfo(), start_pos: start_pos, uuid });
    }
    
    
    /**
     *
     * @param {Room} room_to
     * @param {Point} start_pos
     * @param {string} [uuid=undefined]
     */
    sendRoomTransition(room_to, start_pos, uuid) {
        this.send({ cmd: 'room transition', room: room_to.serialize(), start_pos, uuid });
    }
    
    /**
     *
     * @param {IPlayerInputs} data
     */
    sendPlayerControls(data) {
        let id = this.entity.uuid; // i know right?
        this.broadcastRoom({ cmd: 'player controls', id, ...data }, true);
    }
    
    // #################################
    // You can write your wrappers here:
    
    // for example:
    sendSomething(greeting) {
        this.send({ cmd: 'something', greeting: greeting });
    }
}
