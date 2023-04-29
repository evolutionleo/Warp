import { IProfile, Profile } from '#schemas/profile';
import { IAccount, Account } from '#schemas/account';

import Client from '#concepts/client';
import Lobby from '#concepts/lobby';
import Room from '#concepts/room';
import Party from '#concepts/party';
import PlayerEntity from '#entities/entity_types/player';
import { Sock, SockType } from './socktype';

export default interface IClient {
    /** @type {string} */
    name: string;

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