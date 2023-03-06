import trace from '#util/logging';
import packet from '#internal/packet';
import { lobbyList } from '#concepts/lobby';
import { getAccountInfo } from '#schemas/account';
import { getProfileInfo } from '#schemas/profile';
import chalk from 'chalk';

export default class SendStuff {
    
    /**
     * basic send
     * @param {any} data
     */
    write(data) {
        if (global.config.timestamps_enabled) { // { t: ms passed since the server started }
            data.t = Date.now() - global.start_time;
        }
        
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
     * @param {Client[]} clients
     * @param {object} pack
     * @param {boolean} [notme=true]
     */
    broadcastList(clients, pack, notme = true) {
        let me = this;
        clients.forEach(function (c) {
            if (c === me && notme) { }
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
        if (!global.config.rooms_enabled) {
            trace(chalk.redBright('Can\'t use Client.broadcastRoom() - rooms are disabled in the config!!!'));
            return -1;
        }
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
    }
    
    /**
     * @param {string} msg
     */
    sendMessage(msg) {
        this.send({ cmd: 'message', msg });
    }
    
    /**
     * @param {boolean} compatible
     */
    sendServerInfo(compatible = true) {
        this.send({ cmd: 'server info', meta: global.config.meta, compatible });
    }
    
    
    sendPing() {
        let T = new Date().getTime() - global.start_time;
        this.send({ cmd: 'ping', T });
    }
    
    /**
     * @param {number} T
     */
    sendPong(T) {
        this.send({ cmd: 'pong', T });
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
     * @param {string} status
     * @param {string} [reason='']
     */
    sendLogin(status, reason = '') {
        this.send({ cmd: 'login', status, reason, account: getAccountInfo(this.account), profile: getProfileInfo(this.profile) });
    }
    
    sendPartyInvite(party) {
        this.send({ cmd: 'party invite', party: party.getInfo() });
    }
    
    sendPartyLeave(party, reason, forced) {
        this.send({ cmd: 'party leave', party: party.getInfo(), forced, reason });
    }
    
    sendPartyJoin(party) {
        this.send({ cmd: 'party join', party: party.getInfo() });
    }
    
    sendPartyReject(party, reason = 'Unable to join party') {
        this.send({ cmd: 'party reject', party: party?.getInfo(), reason });
    }
    
    sendPartyInviteSent() {
        
    }
    
    /**
     * @param {Lobby} lobby
     */
    sendLobbyJoin(lobby) {
        this.send({ cmd: 'lobby join', lobby: lobby.getInfo() });
    }
    
    /**
     * @param {Lobby} lobby
     * @param {string} [reason='']
     */
    sendLobbyReject(lobby, reason = '') {
        this.send({ cmd: 'lobby reject', lobby: lobby.getInfo(), reason: reason });
    }
    
    /**
     * @param {Lobby} lobby
     * @param {string} [reason='']
     * @param {boolean} [forced=true]
     */
    sendLobbyLeave(lobby, reason = '', forced = true) {
        this.send({ cmd: 'lobby leave', lobby: lobby.getInfo(), reason: reason, forced: forced });
    }
    
    /**
     * @param {Lobby} lobby
     */
    sendLobbyUpdate(lobby) {
        this.send({ cmd: 'lobby update', lobby: lobby.getInfo() });
    }
    
    sendLobbyList() {
        this.send({ cmd: 'lobby list', lobbies: lobbyList().map(lobby => lobby.getInfo()) }); // lobbies as an array
    }
    
    /**
     * @param {string} lobbyid
     */
    sendLobbyInfo(lobbyid) {
        this.send({ cmd: 'lobby info', lobby: global.lobbies[lobbyid].getInfo() });
    }
    
    /**
     * @param {Lobby} lobby
     * @param {Room} room
     * @param {Point} start_pos
     * @param {string} [uuid=undefined]
     */
    sendPlay(lobby, room, start_pos, uuid) {
        this.send({ cmd: 'play', lobby: lobby.getInfo(), room: (room !== null ? room.serialize() : undefined), start_pos, uuid });
    }
    
    
    /**
     * @param {Room} room_to
     * @param {Point} start_pos
     * @param {string} [uuid=undefined]
     */
    sendRoomTransition(room_to, start_pos, uuid) {
        this.send({ cmd: 'room transition', room: room_to.serialize(), start_pos, uuid });
    }
    
    sendFriends(friends) {
        this.send({ cmd: 'friends', friends: friends.map(f => getProfileInfo(f)) });
    }
    
    sendIncomingFriendRequests(from_profiles) {
        this.send({ cmd: 'friend request inc', from: from_profiles });
    }
    
    sendServerTime(client_t) {
        this.send({ cmd: 'server timestamp', ct: client_t }); // data.t will be appended automatically if timestamps are enabled
    }
    
    /**
     * @param {IPlayerInputs} data
     */
    sendPlayerControls(data) {
        let id = this.entity.uuid; // i know right?
        this.broadcastRoom({ cmd: 'player controls', id, ...data }, true);
    }
    
    
    // #################################
    // You can write your custom wrappers here:
    
    // for example:
    sendSomething(greeting) {
        this.send({ cmd: 'something', greeting: greeting });
    }
}
