import trace from '#util/logging';
import chalk from 'chalk';
import SendStuff from '#cmd/sendStuff';

import mongoose from 'mongoose';
const ObjectId = mongoose.Types.ObjectId;
import { Profile, IProfile, freshProfile, getProfileInfo } from '#schemas/profile';
import { Account, IAccount } from '#schemas/account';
import { FriendRequest, IFriendRequest } from '#schemas/friend_request';

import Point from '#types/point';
import IClient from '#types/client_properties';

import Lobby, { lobbyGet } from '#concepts/lobby';
import Room from '#concepts/room';
import Party, { partyCreate, partyGet } from '#concepts/party';

import PlayerEntity from '#entities/entity_types/player';
import { SockType, Sock } from '#types/socktype';
import MatchMaker from '#util/matchmaker';

export type ClientInfo = {
    name: string;
    partyid: string;
    lobbyid: string;
    room_name: string;
};

// this is a wrapper around sockets
export default class Client extends SendStuff implements IClient {
    name: string = '';
    /** @type {import('ws').WebSocket | import('net').Socket} */
    socket: Sock = null;
    /** @type {'ws' | 'tcp'} */
    type: SockType;
    ip: string;
    
    /** @type {Lobby} */
    lobby: Lobby = null;
    /** @type {Room} */
    room: Room = null;
    /** @type {Party} */
    party: Party = null;

    party_invites: string[] = [];

    /** @type {Account} */
    account: IAccount = null;
    /** @type {Profile} */
    profile: IProfile = null;

    // used internally in packet.ts
    /** @type {Buffer} */
    halfpack: Buffer;

    /** @type {PlayerEntity} */
    entity: PlayerEntity = null;

    /** @type {number} */
    ping: number;

    room_join_timer: number = -1; // if >0 - joined recently

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

    constructor(socket:Sock, type:SockType = 'tcp') {
        super();
        
        this.socket = socket;
        this.type = type.toLowerCase() as SockType;

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
    onLobbyJoin(lobby:Lobby) {
        this.sendLobbyJoin(lobby);
    }

    /**
     * @param {Lobby} lobby
     * @param {string=} reason
     */
    onLobbyReject(lobby:Lobby, reason?:string) {
        reason ??= 'lobby is full!';
        this.sendLobbyReject(lobby, reason);
    }

    /**
     * @param {Lobby} lobby
     * @param {string=} reason
     * @param {boolean=} forced
     */
    onLobbyLeave(lobby:Lobby, reason:string, forced:boolean) {
        this.sendLobbyLeave(lobby, reason, forced);
    }


    onPartyJoin(party:Party) {
        this.sendPartyJoin(party);
    }

    onPartyReject(party:Party, reason:string = '') { // unable to join the party for some reason
        this.sendPartyReject(party, reason);
    }

    onPartyLeave(party:Party, reason:string, forced:boolean) {
        this.sendPartyLeave(party, reason, forced);
    }

    onLogin() { // this.account and this.profile are now defined
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


    getInfo():ClientInfo {
        return {
            name: this.name,
            partyid: this.party?.partyid,
            lobbyid: this.lobby?.lobbyid,
            room_name: this.room?.map.name
        };
    }

    // Below are some preset functions (you probably don't want to change them


    lobbyJoin(lobbyid?:string) {
        var lobby:Lobby;
        if (lobbyid) {
            lobby = lobbyGet(lobbyid);
        }
        else {
            lobby = MatchMaker.findNonfullLobby(this);
        }

        // it also sends the response
        lobby.addPlayer(this);
    }

    async getFriends():Promise<IProfile[]> {
        if (!this.logged_in)
            return [];

        return (await Profile.findById(this.profile._id).populate<{ friends: IProfile[] }>('friends')).friends;
    }

    async getFriendIds() {
        if (!this.logged_in)
            return [];
        
        return this.profile.friends;
    }

    async getIncomingFriendRequests():Promise<IProfile[]> {
        if (!this.logged_in) return [];
        return await FriendRequest.findIncoming(this.profile._id);
    }

    async getOutgoingFriendRequests():Promise<IProfile[]> {
        if (!this.logged_in) return [];
        return await FriendRequest.findOutgoing(this.profile._id);
    }

    /**
     * Send a new friend request or accept an existing one from the user
     * @param friend {IProfile|Client}
     */
    async friendAdd(friend: Client | IProfile): Promise<boolean> {
        friend = friend instanceof Client ? friend.profile : friend;
        if (!this.logged_in) return false;

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

    /**
     * @param {Client|IProfile} user_to
     * @returns {Promise<IFriendRequest>}
     */
    async friendRequestSend(user_to:Client|IProfile):Promise<IFriendRequest> {
        user_to = user_to instanceof Client ? user_to.profile : user_to;
        if (!this.logged_in) return null;

        let sender = this.profile._id;
        let receiver = user_to._id;

        return await FriendRequest.create({ sender, receiver });
    }

    /**
     * @param {Client|IProfile} user_from
     * @param {Client|IProfile} user_to
     * @returns {Promise<IFriendRequest>}
     */
    private async friendRequestFind(user_from:Client|IProfile, user_to:Client|IProfile) {
        user_from = user_from instanceof Client ? user_from.profile : user_from;
        user_to = user_to instanceof Client ? user_to.profile : user_to;

        return await FriendRequest.findRequestId(user_from._id, user_to._id);
    }

    /**
     * @param {Client|IProfile} user_from
     */
    async friendRequestAccept(user_from:Client|IProfile) {
        user_from = user_from instanceof Client ? user_from.profile : user_from;
        if (!this.logged_in) return;

        // find a request FROM the user
        let inc_request_id = await this.friendRequestFind(user_from, this);
        if (inc_request_id) {
            await FriendRequest.accept(inc_request_id); // this method also updates the .friends arrays
        }
    }

    /**
     * @param {Client|IProfile} user_from
     */
    async friendRequestReject(user_from:Client|IProfile) {
        user_from = user_from instanceof Client ? user_from.profile : user_from;
        if (!this.logged_in) return;

        // find a request FROM the user
        let inc_request_id = await this.friendRequestFind(user_from, this);
        if (inc_request_id) {
            await FriendRequest.reject(inc_request_id);
        }
    }

    /**
     * @param {Client|IProfile} user_to
     */
    async friendRequestCancel(user_to:Client|IProfile) {
        user_to = user_to instanceof Client ? user_to.profile : user_to;
        if (!this.logged_in) return null;

        // find a request from us TO the user
        let req_id = await this.friendRequestFind(this, user_to);
        if (req_id) {
            await FriendRequest.cancel(req_id);
        }
    }

    /**
     * @param {Client|IProfile} friend
     */
    async friendRemove(friend:Client|IProfile) {
        friend = friend instanceof Client ? friend.profile : friend;
        if (!this.logged_in) return;

        let my_id = this.profile._id;
        let friend_id = friend._id;

        // delete from each others' profiles
        await Profile.findByIdAndUpdate(my_id, { $pull: { friends: friend_id }});
        await Profile.findByIdAndUpdate(friend_id, { $pull: { friends: my_id }});
    }


    partyCreate() {
        if (this.party)
            this.partyLeave();
        this.party = new Party(this);
        return this.party;
    }

    partyLeave() {
        if (!this.party) return;

        this.party.kickMember(this);
    }

    partyInvite(user: Client) {
        if (!this.party) return;

        user.sendPartyInvite(this.party);
        this.sendPartyInviteSent();
    }

    /**
     * @param {string} partyid
     */
    partyJoin(partyid: string) {
        let party = partyGet(partyid);
        party.addMember(this);
    }

    /**
     * Save account and profile data to the DB
     */
    save() {
        if (this.account !== null) {
            this.account.save()
                .then(() => {
                    trace('Saved the account successfully');
                })
                .catch((err) => {
                    trace('Error while saving account: ' + err);
                });
        }
        if (this.profile !== null) {

            // save the current lobbyid
            if (this.lobby !== null) {
                this.profile.state.lobbyid = this.lobby.lobbyid;
            }

            this.profile.save()
                .then(() => {
                    trace('Saved the profile successfully.');
                })
                .catch((err) => {
                    trace('Error while saving profile: ' + err);
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
     * @param {string} username
     * @param {string} password
     */
    tryLogin(username:string, password:string) {
        let c = this;

        Account.login(username, password)
        .then(function(account:IAccount) {
            // this also sends the message
            c.login(account);
        }).catch(function(reason) {
            c.sendLogin('fail', reason);
        });
    }

    /**
     * @param {string} username
     * @param {string} password
     */
    tryRegister(username:string, password:string) {
        let c = this;

        Account.register(username, password)
        .then(function(account:IAccount) {
            // this also sends the message
            c.register(account);
        }).catch(function(reason:Error) {
            trace('error: ' + reason);
            c.sendRegister('fail', reason.toString());
        });
    }

    /**
     * @param {Account} account
     */
    login(account:IAccount) {
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
        })
    }

    // add any new methods/functions below
}