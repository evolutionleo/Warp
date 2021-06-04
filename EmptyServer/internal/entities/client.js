const SendStuff = require("../../custom/sendStuff.js");
const { Profile, freshProfile } = require('./../schemas/profile.js');

// this is a wrapper around sockets
module.exports = class Client extends SendStuff {
    constructor(socket) {
        super();
        
        this.socket = socket;
        this.lobby = null; // no lobby

        // these are the objects that contain all the meaningful data
        this.account = null; // account info
        this.profile = null; // gameplay info
    }

    // some events
    onJoinLobby(lobby) {
        this.sendJoinLobby(lobby);
    }

    onRejectLobby(lobby, reason) {
        if (!reason)
            reason = 'lobby is full!';
        this.sendRejectLobby(lobby, reason);
    }

    onLeaveLobby(lobby) {
        this.sendKickLobby(lobby, 'you left the lobby!', false);
    }
    
    onKickLobby(lobby, reason) {
        if (!reason)
            reason = '';
        this.sendKickLobby(lobby, reason, true);
    }

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
                    console.log('Error while saving account: ' + err);
                }
                else {
                    console.log('Saved the account successfully');
                }
            })
        }
        if (this.profile !== null) {
            this.profile.save(function(err) {
                if (err) {
                    console.log('Error while saving profile: ' + err);
                }
                else {
                    console.log('Saved the profile successfully.');
                }
            });
        }
    }
    
    register(account) {
        this.account = account;
        this.profile = freshProfile(account);

        // this.save() returns a Promise
        this.save();
        this.sendRegister('success');
    }

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
                console.log('Error: Couldn\'t find a profile with these credentials!');
            }
        })
    }

    // you can also add methods/functions below
    // e.x.

    setUsername(name) {
        this.profile.username = name;
    }
}