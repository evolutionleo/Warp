import trace from '#util/logging';
import chalk from 'chalk';
import SendStuff from '#custom/sendStuff';

import mongoose from 'mongoose';
const ObjectId = mongoose.Types.ObjectId;
import { Profile, freshProfile } from '#schemas/profile';
import { Account } from '#schemas/account';
import { FriendRequest } from '#schemas/friend_request';

import { lobbyGet } from '#concepts/lobby';
import Party, { partyGet } from '#concepts/party';
import MatchMaker from '#util/matchmaker';

// this is a wrapper around sockets
export default class Client extends SendStuff {
    name = '';
    socket = null; /** @type {import('ws').WebSocket | import('net').Socket} */
    type; /** @type {'ws' | 'tcp'} */
    ip;
    
    lobby = null; /** @type {Lobby} */
    room = null; /** @type {Room} */
    party = null; /** @type {Party} */
    
    party_invites = [];
    
    account = null; /** @type {Account} */
    profile = null; /** @type {Profile} */
    
    // used internally in packet.ts
    halfpack; /** @type {Buffer} */
    
    entity = null; /** @type {PlayerEntity} */
    
    ping; /** @type {number} */
    
    room_join_timer = -1; // if >0 - joined recently
    
    /** @type {boolean} */
    get logged_in() {
        return this.profile !== null;
    }
    
    /** @type {number} */
    get mmr() {
        return this.logged_in ? this.profile.mmr : 0;
    }
    
    set mmr(_mmr) {
        if (this.account)
            this.profile.mmr = _mmr;
    }
    
    constructor(socket, type = 'tcp') {
        super();
        
        this.socket = socket;
        this.type = type.toLowerCase();
        
        this.type = type;
        
        this.socket = socket;
        this.lobby = null; // no lobby
        
        // these are the objects that contain all the meaningful data
        this.account = null; // account info
        this.profile = null; // gameplay info
        
        this.ping = -1;
    }
    
    // some events
    
    /**
     * @param {Lobby} lobby
     */
    onLobbyJoin(lobby) {
        this.sendLobbyJoin(lobby);
    }
    
    /**
     * @param {Lobby} lobby
     * @param {string=} reason
     */
    onLobbyReject(lobby, reason) {
        reason ??= 'lobby is full!';
        this.sendLobbyReject(lobby, reason);
    }
    
    /**
     * @param {Lobby} lobby
     * @param {string=} reason
     * @param {boolean=} forced
     */
    onLobbyLeave(lobby, reason, forced) {
        this.sendLobbyLeave(lobby, reason, forced);
    }
    
    
    onPartyJoin(party) {
        this.sendPartyJoin(party);
    }
    
    onPartyReject(party, reason = '') {
        this.sendPartyReject(party, reason);
    }
    
    onPartyLeave(party, reason, forced) {
        this.sendPartyLeave(party, reason, forced);
    }
    
    onLogin() {
        this.profile.online = true;
        this.profile.last_online = new Date();
        this.name = this.profile.name;
        
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
        var room = null;
        
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
            if (this.room !== null) { // either change rooms or
                this.room.movePlayer(this, room);
            }
            else { // just join the new room
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
        if (this.lobby)
            this.lobby.kickPlayer(this, 'disconnected', true);
        if  (this.party)
            this.party.kickMember(this, 'disconnected', true);
    }
    
    
    getInfo() {
        return {
            name: this.name,
            partyid: this.party?.partyid,
            lobbyid: this.lobby?.lobbyid,
            room_name: this.room?.map.name
        };
    }
    
    // Below are some preset functions (you probably don't want to change them
    
    
    lobbyJoin(lobbyid) {
        var lobby;
        if (lobbyid) {
            lobby = lobbyGet(lobbyid);
        }
        else {
            lobby = MatchMaker.findNonfullLobby(this);
        }
        
        // it also sends the response
        lobby.addPlayer(this);
    }
    
    async getFriends() {
        if (!this.logged_in)
            return [];
        
        return (await Profile.findById(this.profile._id).populate('friends')).friends;
    }
    
    async getFriendIds() {
        if (!this.logged_in)
            return [];
        
        return this.profile.friends;
    }
    
    async getIncomingFriendRequests() {
        if (!this.logged_in)
            return [];
        return await FriendRequest.findIncoming(this.profile._id);
    }
    
    async getOutgoingFriendRequests() {
        if (!this.logged_in)
            return [];
        return await FriendRequest.findOutgoing(this.profile._id);
    }
    
    /**
     * Send a new friend request or accept an existing one from the user
     * @param friend {IProfile|Client}
     */
    async friendAdd(friend) {
        friend = friend instanceof Client ? friend.profile : friend;
        if (!this.logged_in)
            return false;
        
        let sender_id = this.profile._id;
        let receiver_id = friend._id;
        
        let friend_exists = this.profile.friends.includes(receiver_id);
        if (friend_exists) { // already friends
            trace('already friends');
            return false;
        }
        
        let out_request_exists = await FriendRequest.requestExists(sender_id, receiver_id);
        let inc_request_exists = await FriendRequest.requestExists(receiver_id, sender_id);
        
        if (inc_request_exists) { // there is already an incoming request - accept it
            await this.friendRequestAccept(friend);
            trace('request accepted');
            return true;
        }
        else if (out_request_exists) { // we already sent a request
            trace('request already exists');
            return false;
        }
        else { // send a new request
            let req = await this.friendRequestSend(friend);
            trace('request sent');
            return !!req;
        }
    }
    
    async friendRequestSend(user_to) {
        user_to = user_to instanceof Client ? user_to.profile : user_to;
        if (!this.logged_in)
            return null;
        
        let sender = this.profile._id;
        let receiver = user_to._id;
        
        return await FriendRequest.create({ sender, receiver });
    }
    
    async friendRequestFind(user_from, user_to) {
        user_from = user_from instanceof Client ? user_from.profile : user_from;
        user_to = user_to instanceof Client ? user_to.profile : user_to;
        
        return await FriendRequest.findRequestId(user_from._id, user_to._id);
    }
    
    async friendRequestAccept(user_from) {
        user_from = user_from instanceof Client ? user_from.profile : user_from;
        if (!this.logged_in)
            return;
        
        // find a request FROM the user
        let inc_request_id = await this.friendRequestFind(user_from, this);
        if (inc_request_id) {
            await FriendRequest.accept(inc_request_id); // this method also updates the .friends arrays
        }
    }
    
    async friendRequestReject(user_from) {
        user_from = user_from instanceof Client ? user_from.profile : user_from;
        if (!this.logged_in)
            return;
        
        // find a request FROM the user
        let inc_request_id = await this.friendRequestFind(user_from, this);
        if (inc_request_id) {
            await FriendRequest.reject(inc_request_id);
        }
    }
    
    async friendRequestCancel(user_to) {
        user_to = user_to instanceof Client ? user_to.profile : user_to;
        if (!this.logged_in)
            return null;
        
        // find a request from us TO the user
        let req_id = await this.friendRequestFind(this, user_to);
        if (req_id) {
            await FriendRequest.cancel(req_id);
        }
    }
    
    async friendRemove(friend) {
        friend = friend instanceof Client ? friend.profile : friend;
        if (!this.logged_in)
            return;
        
        let my_id = this.profile._id;
        let friend_id = friend._id;
        
        // delete from each others' profiles
        await Profile.findByIdAndUpdate(my_id, { $pull: { friends: friend_id } });
        await Profile.findByIdAndUpdate(friend_id, { $pull: { friends: my_id } });
    }
    
    
    
    partyCreate() {
        if (this.party)
            this.partyLeave();
        this.party = new Party(this);
        return this.party;
    }
    
    partyLeave() {
        if (!this.party)
            return;
        
        this.party.kickMember(this);
    }
    
    partyInvite(user) {
        if (!this.party)
            return;
        
        user.sendPartyInvite(this.party);
        this.sendPartyInviteSent();
    }
    
    partyJoin(partyid) {
        let party = partyGet(partyid);
        party.addMember(this);
    }
    
    /**
     * Save account and profile data to the DB
     */
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
            
            // save the current lobbyid
            if (this.lobby !== null) {
                this.profile.state.lobbyid = this.lobby.lobbyid;
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
        
        this.onLogin();
        this.sendRegister('success');
    }
    
    
    /**
     * @param {string} username
     * @param {string} password
     */
    tryLogin(username, password) {
        let c = this;
        
        Account.login(username, password)
            .then(function (account) {
            // this also sends the message
            c.login(account);
        }).catch(function (reason) {
            c.sendLogin('fail', reason);
        });
    }
    
    /**
     * @param {string} username
     * @param {string} password
     */
    tryRegister(username, password) {
        let c = this;
        
        Account.register(username, password)
            .then(function (account) {
            // this also sends the message
            c.register(account);
        }).catch(function (reason) {
            trace('error: ' + reason);
            c.sendRegister('fail', reason.toString());
        });
    }
    
    /**
     * @param {Account} account
     */
    login(account) {
        let c = this;
        this.account = account;
        
        Profile.findOne({
            account_id: this.account._id
        }).then((profile) => {
            if (profile) {
                this.profile = profile;
                c.onLogin();
                
                c.sendLogin('success');
            }
            else {
                trace('Error: Couldn\'t find a profile with these credentials!');
            }
        });
    }
}
