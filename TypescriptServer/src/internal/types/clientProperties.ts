import { IProfile, Profile } from '#schemas/profile';
import { IAccount, Account } from '#schemas/account';

import Client from '#concepts/client';
import Lobby from '#concepts/lobby';
import Room from '#concepts/room';
import Party from '#concepts/party';
import PlayerEntity from '#entities/entity_types/player';
import { Sock, SockType } from './socktype';

export default class ClientProperties {
    /** @type {import('ws').WebSocket | import('net').Socket} */
    socket: Sock;
    /** @type {'ws' | 'tcp'} */
    type: SockType;
    
    /** @type {Lobby} */
    lobby: Lobby = null;

    /** @type {Room} */
    room: Room = null;

    /** @type {Party} */
    party: Party = null;


    /** @type {Account} */
    account: IAccount = null;
    /** @type {Profile} */
    profile: IProfile = null;

    /** @type {Buffer} */
    halfpack: Buffer; // used internally in packet.ts

    /** @type {PlayerEntity} */
    entity: PlayerEntity = null;

    /** @type {number} */
    ping: number;

    /** @type {number} */
    get mmr() {
        return this.account ? this.account.mmr : 0;
    }

    set mmr(_mmr) {
        if (this.account)
            this.account.mmr = _mmr;
    }

    /** @type {Client[]} */
    get friends() {
        return this.account ? this.account.friends : [];
    }
}