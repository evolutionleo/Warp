import { IProfile } from '#schemas/profile';
import { IAccount } from '#schemas/account';

import { Socket } from 'net';

import Lobby from '#concepts/lobby';
import Room from '#concepts/room';
import PlayerEntity from '#entities/entity_types/player';

export default class ClientProperties {
    socket: Socket;
    
    lobby: Lobby;
    room: Room;

    account: IAccount;
    profile: IProfile;

    halfpack: Buffer; // used internally in packet.ts

    entity: PlayerEntity;
}