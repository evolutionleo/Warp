import packet from '#internal/packet';
import { Socket } from 'net';
import Lobby from '#entities/lobby';
import { Account, IAccount } from '#schemas/account';
import { Profile, IProfile } from '#schemas/profile'
import Point from '#types/point';

export default class SendStuff {
    socket: Socket|null;
    lobby: Lobby;
    account: IAccount;
    profile: IProfile;

    constructor() {}

    // basic send
    write(data:object) {
        return this.socket.write(packet.build(data));
    }

    send(data:object) { // just another name
        return this.write(data);
    }
    
    // different types of broadcast
    broadcastList(clients:SendStuff[], pack:object, notme:boolean = true) {
        clients.forEach(function(c) {
            if (c === this && notme) {}
            else {
                c.write(pack);
            }
        });
    }

    broadcastAll(pack:object, notme?:boolean) {
        return this.broadcastList(global.clients, pack, notme);
    }

    broadcastLobby(pack:object, notme?:boolean) {
        if (this.lobby === null)
            return -1

        return this.broadcastList(this.lobby.players, pack, notme);
    }
    
    // these functions can be later called using %insert_client%.sendThing()
    // in handlePacket.js or wherever else where you have client objects
    sendHello():void {
        this.write({cmd: 'hello', str: 'Hello, client!'})
        this.write({cmd: 'hello2', str: 'Hello again, client!'})
    }

    sendMessage(msg:string):void {
        this.write({cmd: 'message', msg: msg})
    }

    // these are some preset functions

    sendRegister(status:string, reason:string = ''):void {
        this.write({cmd: 'register', status: status, reason: reason});
    }

    sendLogin(status:string, reason:string = ''):void {
        this.write({cmd: 'login', status: status, reason: reason, account: this.account, profile: this.profile});
    }

    sendJoinLobby(lobby:Lobby):void {
        this.write({ cmd: 'lobby join', lobby: lobby.serialize() });
    }

    sendRejectLobby(lobby:Lobby, reason:string = ''):void {
        this.write({ cmd: 'lobby reject', lobby: lobby.serialize(), reason: reason });
    }

    sendKickLobby(lobby:Lobby, reason:string = '', forced:boolean = true):void {
        this.write({ cmd: 'lobby leave', lobby: lobby.serialize(), reason: reason, forced: forced });
    }

    sendUpdateLobby(lobby:Lobby):void { // some data changed
        this.write({ cmd: 'lobby update', lobby: lobby.serialize() });
    }

    sendLobbyList():void {
        this.write({ cmd: 'lobby list', lobbies: Object.values(global.lobbies).map(lobby => lobby.serialize()) }); // lobbies as an array
    }

    sendLobbyInfo(lobbyid:string):void {
        this.write({ cmd: 'lobby info', lobby: global.lobbies[lobbyid].serialize()})
    }

    sendPlay(lobby:Lobby, start_pos:Point):void {
        this.write({ cmd: 'play', lobby: lobby.serialize(), start_pos: start_pos });
    }

    // #################################
    // You can write your wrappers here:
}