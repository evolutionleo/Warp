import { IProfile, Profile } from '#schemas/profile';
import { IAccount, Account } from '#schemas/account';

import Lobby from '#concepts/lobby';
import Room from '#concepts/room';
import Party from '#concepts/party';
import PlayerEntity from '#entities/player';
import { Sock, SockType } from './socktype';
import Match from '#matchmaking/match';

export default interface IClient {
    /** @type {string} */
    name: string;
    /** @type {string} */
    temp_id: string;

    /** @type {import('ws').WebSocket | import('net').Socket} */
    socket: Sock;
    /** @type {'ws' | 'tcp'} */
    type: SockType;
    
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

    /** @type {Buffer} */
    halfpack: Buffer; // used internally in packet.ts

    /** @type {PlayerEntity} */
    entity: PlayerEntity;

    /** @type {number} */
    ping: number;

    logged_in: boolean;

    getFriends():Promise<IProfile[]>;
}