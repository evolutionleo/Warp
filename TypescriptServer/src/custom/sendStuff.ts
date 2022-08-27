import trace from '#util/logging';
import packet from '#internal/packet';
import { Socket } from 'net';
import Lobby from '#concepts/lobby';
import { Account, IAccount } from '#schemas/account';
import { Profile, IProfile } from '#schemas/profile'
import Point from '#types/point';
import Entity from '#concepts/entity';
import Room from '#concepts/room';
import Client from '#concepts/client';
import PlayerEntity, { IPlayerInputs } from '#entity/player';
import { SockType, Sock } from '#types/socktype';
import * as net from 'net';
import * as ws from 'ws';
import chalk from 'chalk';
// import ClientProperties from '#types/clientProperties';


export default class SendStuff {
    socket: Sock;
    type: SockType;

    lobby: Lobby = null;
    room: Room = null;

    account: IAccount = null;
    profile: IProfile = null;

    halfpack: Buffer; // used internally in packet.ts

    entity: PlayerEntity = null;


    /**
     * 
     * @param {Sock} socket
     * @param {string} type
     */
    constructor(socket: Sock, type: string) {
        this.socket = socket;
        this.type = type.toLowerCase() as SockType;
    }


    /** 
     * basic send
     * @param {object} data 
     */
    write(data: object) {
        // console.log(Object.keys(packet));

        if (this.type === 'ws') {
            (this.socket as ws).send(packet.ws_build(data));
        }
        else {
            (this.socket as net.Socket).write(packet.build(data));
        }
    }

    /**
     * same as .write()
     * @param {object} data 
     */
    send(data: object) { // just another name
        return this.write(data);
    }

    // different types of broadcast
    /**
     * 
     * @param {any[]} clients 
     * @param {object} pack 
     * @param {boolean} [notme=true] 
     */
    broadcastList(clients: SendStuff[], pack: object, notme: boolean = true) {
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
    broadcastAll(pack: object, notme?: boolean) {
        return this.broadcastList(global.clients, pack, notme);
    }

    /**
     * @param {object} pack 
     * @param {boolean} [notme=true]
     */
    broadcastLobby(pack: object, notme?: boolean) {
        if (this.lobby === null)
            return -1

        return this.broadcastList(this.lobby.players, pack, notme);
    }

    broadcastRoom(pack: object, notme: boolean) {
        if (!global.config.rooms_enabled) {
            trace(chalk.redBright('Can\'t use Client.broadcastRoom() - rooms are disabled in the config!!!'));
            return -1;
        }
        if (this.room === null)
            return -1

        return this.broadcastList(this.room.players, pack, notme);
    }

    // !!!
    // these functions can be later called using some_client.sendThing()
    // in handlePacket.js or wherever else where you have client objects
    // !!!
    sendHello(): void {
        this.send({ cmd: 'hello', str: 'Hello, client!' })
        this.send({ cmd: 'hello2', str: 'Hello again, client!' })
    }

    /**
     * @param {string} msg 
     */
    sendMessage(msg: string): void {
        this.send({ cmd: 'message', msg })
    }


    sendPing() {
        let t = new Date().getTime() - global.start_time;
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
    sendRegister(status: string, reason: string = ''): void {
        this.send({ cmd: 'register', status: status, reason: reason });
    }

    /**
     * 
     * @param {string} status 
     * @param {string} [reason=''] 
     */
    sendLogin(status: string, reason: string = ''): void {
        this.send({ cmd: 'login', status: status, reason: reason, account: this.account?.toJSON(), profile: this.profile?.toJSON() });
    }

    /**
     * Send new account information when updated
     */
    sendAccount() {
        this.send({ cmd: 'account', account: this.account?.toJSON() });
    }

    /**
     * Send new profile information when updated
     */
    sendProfile() {
        this.send({ cmd: 'profile', profile: this.profile?.toJSON() });
    }

    /**
     * 
     * @param {Lobby} lobby 
     */
    sendJoinLobby(lobby: Lobby): void {
        this.send({ cmd: 'lobby join', lobby: lobby.getInfo() });
    }

    /**
     * 
     * @param {Lobby} lobby 
     * @param {string} [reason='']
     */
    sendRejectLobby(lobby: Lobby, reason: string = ''): void {
        this.send({ cmd: 'lobby reject', lobby: lobby.getInfo(), reason: reason });
    }

    /**
     * 
     * @param {Lobby} lobby 
     * @param {string} [reason=''] 
     * @param {boolean} [forced=true]
     */
    sendKickLobby(lobby: Lobby, reason: string = '', forced: boolean = true): void {
        this.send({ cmd: 'lobby leave', lobby: lobby.getInfo(), reason: reason, forced: forced });
    }

    /**
     * 
     * @param {Lobby} lobby 
     */
    sendUpdateLobby(lobby: Lobby): void { // some data changed
        this.send({ cmd: 'lobby update', lobby: lobby.getInfo() });
    }

    sendLobbyList(): void {
        this.send({ cmd: 'lobby list', lobbies: Object.values(global.lobbies).map(lobby => lobby.getInfo()) }); // lobbies as an array
    }

    /**
     * 
     * @param {string} lobbyid 
     */
    sendLobbyInfo(lobbyid: string): void {
        this.send({ cmd: 'lobby info', lobby: global.lobbies[lobbyid].getInfo() })
    }

    /**
     * 
     * @param {Lobby} lobby 
     * @param {Room} room 
     * @param {Point} start_pos 
     * @param {string} [uuid=undefined]
     */
    sendPlay(lobby: Lobby, room?: Room, start_pos?: Point, uuid?: string): void {
        this.send({ cmd: 'play', lobby: lobby.getInfo(), room: (room !== null ? room.serialize() : undefined), start_pos, uuid });
    }


    /**
     * 
     * @param {Room} room_to
     * @param {Point} start_pos
     * @param {string} [uuid=undefined]
     */
    sendRoomTransition(room_to: Room, start_pos?: Point, uuid?: string): void {
        this.send({ cmd: 'room transition', room: room_to.serialize(), start_pos, uuid });
    }

    /**
     * 
     * @param {IPlayerInputs} data 
     */
    sendPlayerControls(data: IPlayerInputs) {
        let id = (this as unknown as Client).entity.uuid; // i know right?
        this.broadcastRoom({ cmd: 'player controls', id, ...data }, true);
    }

    // #################################
    // You can write your wrappers here:

    // for example:
    sendSomething(greeting: string) {
        this.send({ cmd: 'something', greeting: greeting });
    }
}