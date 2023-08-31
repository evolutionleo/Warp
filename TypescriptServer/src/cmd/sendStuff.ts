import trace from '#util/logging';
import packet from '#packet';
import Lobby from '#concepts/lobby';
import { IAccount } from '#schemas/account';
import { IProfile } from '#schemas/profile'
import Room from '#concepts/room';
import PlayerEntity from '#entities/player';
import { SockType, Sock } from '#types/socktype';
import * as net from 'net';
import * as ws from 'ws';
import chalk from 'chalk';
import Party from '#concepts/party';
import IClient from '#types/client_properties';
import Match from '#matchmaking/match';


// sender functions can be later called using some_client.sendThing()
// in handlePacket.js or wherever else where you have client objects

export abstract class SendStuff implements IClient {
    abstract name: string;
    abstract temp_id: string;
    abstract socket: Sock;
    abstract type: SockType;
     
    abstract lobby: Lobby;
    abstract room: Room;
    abstract party: Party;
    abstract match: Match;

    abstract account: IAccount;
    abstract profile: IProfile;

    abstract halfpack: Buffer;
    abstract entity: PlayerEntity;

    
    abstract ping: number;

    abstract logged_in: boolean;

    abstract getFriends():Promise<IProfile[]>;

    /** 
     * basic send
     * @param {any} data 
     */
    write(data:any) {
        if (global.config.timestamps_enabled) { // { t: ms passed since the server started }
            data.t = Date.now() - global.start_time;
        }

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
    send(data:object) { // just another name
        return this.write(data);
    }
    
    // different types of broadcast
    /**
     * @param {Client[]} clients 
     * @param {object} pack 
     * @param {boolean} [notme=true] 
     */
    broadcastList(clients:SendStuff[], pack:object, notme:boolean = true) {
        clients.forEach((c) => {
            if (c === this && notme) {}
            else {
                c.write(pack);
            }
        });
    }

    /**
     * @param {object} pack 
     * @param {boolean} [notme=true] 
     */
    broadcastAll(pack:object, notme?:boolean) {
        return this.broadcastList(global.clients, pack, notme);
    }

    /**
     * @param {object} pack 
     * @param {boolean} [notme=true]
     */
    broadcastLobby(pack:object, notme?:boolean) {
        if (this.lobby === null)
            return -1

        return this.broadcastList(this.lobby.players, pack, notme);
    }

    broadcastRoom(pack:object, notme:boolean) {
        if (!global.config.rooms_enabled) {
            trace(chalk.redBright('Can\'t use Client.broadcastRoom() - rooms are disabled in the config!!!'));
            return -1;
        }
        if (this.room === null)
            return -1
        
        return this.broadcastList(this.room.players, pack, notme);
    }


    // ##############################################
    // You can add your custom senders either here directly, or inside cmd/senders/

    // for example:
    sendHello():void {
        this.send({cmd: 'hello', str: 'Hello, client!'})
    }

    /**
     * @param {string} msg
     */
    sendMessage(msg:string):void {
        this.send({cmd: 'message', msg})
    }
}

export default SendStuff;