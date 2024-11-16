import { IProfile, Profile } from '#schemas/profile';
import { IAccount, Account } from '#schemas/account';

import Lobby from '#concepts/lobby';
import Room from '#concepts/room';
import Party from '#matchmaking/party';
import PlayerEntity from '#entities/player';
import { Sock, SockType } from './socktype';
import Match from '#matchmaking/match';
import { ISession } from '#schemas/session';

export default interface IClient {
    /** @type {boolean} */
    connected: boolean;

    /** @type {string} */
    name: string;
    /** @type {string} */
    temp_id: string;

    /** @type {import('ws').WebSocket | import('net').Socket} */
    socket: Sock;
    /** @type {'ws' | 'tcp'} */
    socket_type: SockType;
    
    /** @type {Lobby} */
    lobby: Lobby;

    /** @type {Room} */
    room: Room;

    /** @type {Party} */
    party: Party;

    /** @type {Match} */
    match: Match


    /** @type {Account} */
    account: IAccount;
    /** @type {Profile} */
    profile: IProfile;
    /** @type {ISession} */
    session: ISession;

    // used internally in packet.ts
    /** @type {Buffer} */
    halfpack: Buffer;
    /** @type {any[]} */
    packetQueue: any[];

    /** @type {PlayerEntity} */
    entity: PlayerEntity;

    /** @type {number} */
    ping: number;

    logged_in: boolean;

    getFriends():Promise<IProfile[]>;
}