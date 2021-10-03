const SendStuff = require("../../custom/sendStuff.js");
const { Profile, freshProfile } = require('./../schemas/profile.js');
const net = require('net');

// const Lobby = require('./lobby.js');

// this is a wrapper around sockets
/**
 * @extends SendStuff
 */
module.exports = class Client extends SendStuff {
    /**
     * @param {net.Socket} socket
     * @param {string} type
     */
    constructor(socket, type = 'tcp') {
        super(socket, type);

        this.type = type;
        
        this.socket = socket;
        this.lobby = null; // no lobby

        // these are the objects that contain all the meaningful data
        this.account = null; // account info
        this.profile = null; // gameplay info
    }

    // some events

    /**
     * @param {Lobby} lobby 
     */
    onJoinLobby(lobby) {
        this.sendJoinLobby(lobby);
    }

    /**
     * @param {Lobby} lobby 
     * @param {string} reason 
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
     * 
     * @param {Lobby} lobby 
     * @param {string} reason 
     */
    onKickLobby(lobby, reason) {
        if (!reason)
            reason = '';
        this.sendKickLobby(lobby, reason, true);
    }

    /**
     * 
     * @param {Lobby} lobby 
     * @param {Point} start_pos 
     */
    onPlay(lobby, start_pos) {
        this.sendPlay(lobby, start_pos);
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
    
    /**
     * @param {Account} account 
     */
    register(account) {
        this.account = account;
        this.profile = freshProfile(account);

        // this.save() returns a Promise
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
                this.sendLogin('success', this.profile);
            }
            else {
                trace('Error: Couldn\'t find a profile with these credentials!');
            }
        })
    }

    // you can also add custom methods/functions below
    // e.x.

    /**
     * @param {string} name
     */
    setUsername(name) {
        this.profile.username = name;
    }
}