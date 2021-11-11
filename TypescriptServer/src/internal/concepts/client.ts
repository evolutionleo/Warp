import trace from '#util/logging';
import SendStuff from '#custom/sendStuff';
import { Profile, IProfile, freshProfile } from '#schemas/profile';
import { Account, IAccount } from '#schemas/account';

import { Socket } from 'net';
import Point from '#root/internal/types/point';

import Lobby from '#concepts/lobby';
import Room from '#concepts/room';
import PlayerEntity from '#entities/entity_types/player';



export class ClientProperties {
    socket: Socket;
    
    lobby: Lobby;
    room: Room;

    account: IAccount;
    profile: IProfile;

    halfpack: Buffer; // used internally in packet.ts

    entity: PlayerEntity;
}


// this is a wrapper around sockets
export default class Client extends SendStuff {
    constructor(socket:Socket) {
        super();
        
        this.socket = socket;
        this.lobby = null; // no lobby

        // these are the objects that contain all the meaningful data
        this.account = null; // account info
        this.profile = null; // gameplay info
    }

    // some events
    onJoinLobby(lobby:Lobby) {
        this.sendJoinLobby(lobby);
    }

    onRejectLobby(lobby:Lobby, reason?:string) {
        if (!reason)
            reason = 'lobby is full!';
        this.sendRejectLobby(lobby, reason);
    }

    onLeaveLobby(lobby:Lobby) {
        this.sendKickLobby(lobby, 'you left the lobby!', false);
    }
    
    onKickLobby(lobby:Lobby, reason?:string, forced?:boolean) {
        if (!reason)
            reason = '';
        if (forced === null || forced === undefined)
            forced = true;
        this.sendKickLobby(lobby, reason, forced);
    }

    onPlay() {
        if (!this.profile) {
            if (!global.config.necessary_login) {
                var room = this.lobby.rooms.find(room => {
                    return room.map.name === global.config.starting_room;
                });
            }
            else {
                console.error('non-logged in player entering the playing state! if it\'s intentional, please disable config.necessary_login');
                return -1;
            }
        }
        else if (this.profile) {
            var room = this.lobby.rooms.find(room => {
                return room.map.name === this.profile.room;
            });
        }
        room.addPlayer(this);
        this.sendPlay(this.lobby, room, this.entity.pos, this.entity.uuid);
    }

    onDisconnect() {
        this.save();
        if (this.lobby !== null)
            this.lobby.kickPlayer(this, 'disconnected', true);
    }

    // preset functions

    // this one saves everything
    save() {
        if (this.account !== null) {
            this.account.save(function(err) {
                if (err) {
                    trace('Error while saving account: ' + err);
                }
                else {
                    trace('Saved the account successfully');
                }
            })
        }
        if (this.profile !== null) {
            this.profile.save(function(err) {
                if (err) {
                    trace('Error while saving profile: ' + err);
                }
                else {
                    trace('Saved the profile successfully.');
                }
            });
        }
    }
    
    register(account:IAccount) {
        this.account = account;
        this.profile = freshProfile(account);

        // this.save() returns a Promise
        this.save();
        this.sendRegister('success');
    }

    login(account:IAccount) {
        this.account = account;
        Profile.findOne({
            account_id: this.account._id
        }).then((profile) => {
            if (profile) {
                this.profile = profile;
                this.sendLogin('success');
            }
            else {
                trace('Error: Couldn\'t find a profile with these credentials!');
            }
        })
    }

    // you can also add methods/functions below
}