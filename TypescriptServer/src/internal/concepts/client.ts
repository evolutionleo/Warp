import trace from '#util/logging';
import SendStuff from '#custom/sendStuff';
import { Profile, IProfile, freshProfile } from '#schemas/profile';
import { Account, IAccount } from '#schemas/account';

import { Socket } from 'net';
import Point from '#root/internal/types/point';

import Lobby from '#concepts/lobby';
import Room from '#concepts/room';
import PlayerEntity from '#entities/entity_types/player';
import { SockType, Sock } from '#types/socktype';
import chalk from 'chalk';

// this is a wrapper around sockets
export default class Client extends SendStuff {
    constructor(socket:Sock, type:SockType = 'tcp') {
        super(socket, type);

        this.type = type;
        
        this.socket = socket;
        this.lobby = null; // no lobby

        // these are the objects that contain all the meaningful data
        this.account = null; // account info
        this.profile = null; // gameplay info

        this.ping = -1;
    }

    /**
     * @param {Lobby} lobby
     */
    // some events
    onJoinLobby(lobby:Lobby) {
        this.sendJoinLobby(lobby);
    }

    /**
     * @param {Lobby} lobby
     * @param {string=} reason
     */
    onRejectLobby(lobby:Lobby, reason?:string) {
        if (!reason)
            reason = 'lobby is full!';
        this.sendRejectLobby(lobby, reason);
    }

    /**
     * @param {Lobby} lobby
     */
    onLeaveLobby(lobby:Lobby) {
        this.sendKickLobby(lobby, 'you left the lobby!', false);
    }
    
    /**
     * @param {Lobby} lobby
     * @param {string=} reason
     * @param {boolean=} forced
     */
    onKickLobby(lobby:Lobby, reason?:string, forced?:boolean) {
        if (!reason)
            reason = '';
        if (forced === null || forced === undefined)
            forced = true;
        this.sendKickLobby(lobby, reason, forced);
    }

    onLogin() { // this.account and this.profile are now defined
        this.profile.online = true;
        this.profile.last_online = new Date();

        this.save();
    }

    onPlay() {
        // if not using rooms
        if (!global.config.rooms_enabled) {
            this.sendPlay(this.lobby, null, null, null);
            return;
        }

        // login necessary AND we're not logged in
        if (global.config.necessary_login && !this.logged_in) {
            trace(chalk.redBright('non-logged in player entering the playing state! if it\'s intentional, please disable config.necessary_login'));
            return -1;
        }

        // find a room to join
        var room:Room = null;

        // join the room last visited (saved in profile)
        if (global.config.room.use_last_profile_room && this.logged_in && this.profile.state.room) {
            room = this.lobby.findRoomByMapName(this.profile.state.room);
        }
        // join the default starting room (from config)
        else if (global.config.room.use_starting_room) {
            room = this.lobby.findRoomByMapName(global.config.room.starting_room);
        }
        // join the first room in the lobby that isn't the current room?
        else {
            let c = this;
            room = this.lobby.rooms.find(r => r !== c.room);
        }

        // if we found a room to join in the end
        if (room) {
            if (this.room !== null) {
                this.room.movePlayer(this, room);
            }
            else {
                room.addPlayer(this);
            }
        }

        if (this.entity !== null) {
            this.sendPlay(this.lobby, room, this.entity.pos, this.entity.uuid);
        }
        else {
            this.sendPlay(this.lobby, room);
        }
    }

    onDisconnect() {
        // go offline
        if (this.logged_in) {
            this.profile.online = false;
            this.profile.last_online = new Date();
        }

        // save everything to the DB
        this.save();
        
        // leave the lobby (if we're currently in one)
        if (this.lobby !== null)
            this.lobby.kickPlayer(this, 'disconnected', true);
    }


    // preset functions below (you probably don't want to change them)

    // this one saves everything to the DB
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

            // save the current lobbyid
            if (this.lobby !== null) {
                this.profile.state.lobbyid = this.lobby.lobbyid;
            }

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
    
    /**
     * @param {Account} account
     */
    register(account:IAccount) {
        this.account = account;
        this.profile = freshProfile(account);

        this.onLogin();
        this.sendRegister('success');
    }

    /**
     * @param {Account} account
     */
    login(account:IAccount) {
        this.account = account;
        Profile.findOne({
            account_id: this.account._id
        }).then((profile) => {
            if (profile) {
                this.profile = profile;
                this.onLogin();

                this.sendLogin('success');
            }
            else {
                trace('Error: Couldn\'t find a profile with these credentials!');
            }
        })
    }

    // add any new methods/functions below
}