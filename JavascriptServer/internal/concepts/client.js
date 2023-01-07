import trace from '#util/logging';
import SendStuff from '#custom/sendStuff';
import { Profile, freshProfile } from '#schemas/profile';
import chalk from 'chalk';

// this is a wrapper around sockets
export default class Client extends SendStuff {
    static type = {
        tcp: 'tcp',
        ws: 'ws',
    };

    constructor(socket, type = Client.tcp) {
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
    onJoinLobby(lobby) {
        this.sendJoinLobby(lobby);
    }
    
    /**
     * @param {Lobby} lobby
     * @param {string=} reason
     */
    onRejectLobby(lobby, reason) {
        if (!reason)
            reason = 'lobby is full!';
        this.sendRejectLobby(lobby, reason);
    }
    
    /**
     * @param {Lobby} lobby
     */
    onLeaveLobby(lobby) {
        this.sendKickLobby(lobby, 'you left the lobby!', false);
    }
    
    /**
     * @param {Lobby} lobby
     * @param {string=} reason
     * @param {boolean=} forced
     */
    onKickLobby(lobby, reason, forced) {
        if (!reason)
            reason = '';
        if (forced === null || forced === undefined)
            forced = true;
        this.sendKickLobby(lobby, reason, forced);
    }
    
    onPlay() {
        if (global.config.rooms_enabled) {
            if (!this.profile) {
                if (!global.config.necessary_login) {
                    var room = this.lobby.rooms.find(room => {
                        return room.map.name === global.config.room.starting_room;
                    });
                }
                else {
                    trace(chalk.redBright('non-logged in player entering the playing state! if it\'s intentional, please disable config.necessary_login'));
                    return -1;
                }
            }
            else if (this.profile) { // load the room from profile
                var room = this.lobby.rooms.find(room => {
                    return room.map.name === this.profile.room;
                });
            }
            room.addPlayer(this);
            
            if (this.entity !== null) {
                this.sendPlay(this.lobby, room, this.entity.pos, this.entity.uuid);
            }
            else {
                this.sendPlay(this.lobby, room);
            }
        }
        else { // not using rooms
            this.sendPlay(this.lobby, null, null, null);
        }
    }
    
    onDisconnect() {
        this.save();
        if (this.lobby !== null)
            this.lobby.kickPlayer(this, 'disconnected', true);
    }
    
    
    // preset functions below (you probably don't want to change them)
    
    // this one saves everything to the DB
    save() {
        if (this.account !== null) {
            this.account.save(function (err) {
                if (err) {
                    trace('Error while saving account: ' + err);
                }
                else {
                    trace('Saved the account successfully');
                }
            });
        }
        if (this.profile !== null) {
            
            if (this.lobby !== null) {
                // save the current lobbyid
                this.profile.lobbyid = this.lobby.lobbyid;
            }
            
            this.profile.save(function (err) {
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
    register(account) {
        this.account = account;
        this.profile = freshProfile(account);
        
        this.save();
        this.sendRegister('success');
    }
    
    /**
     * @param {Account} account
     */
    login(account) {
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
        });
    }
}
