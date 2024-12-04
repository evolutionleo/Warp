import trace from '#util/logging';
import chalk from 'chalk';
import { SendStuff } from '#cmd/sendStuff';

import { Profile } from '#schemas/profile';
import { FriendRequest } from '#schemas/friend_request';

import { profileCreate } from '#util/auth';

import { lobbyFind } from '#concepts/lobby';
import { partyCreate, partyGet } from '#matchmaking/party';
import MatchMaker from '#matchmaking/matchmaker';
import { Names } from '#util/names';
import { chatFind } from '#concepts/chat';

// this is a wrapper around sockets
export default class Client extends SendStuff {
    /** @type {boolean} */
    connected;
    
    /** @type {string} */
    name = '';
    /** @type {string} */
    temp_id; // a temporary randomly generated id string
    
    /** @type {WebSocket | TCPSocket} */
    socket = null;
    /** @type {'ws' | 'tcp'} */
    socket_type;
    ip;
    
    /** @type {Lobby} */
    lobby = null;
    /** @type {Room} */
    room = null;
    /** @type {Party} */
    party = null;
    
    /** @type {Ticket} */
    ticket = null;
    
    /** @type {Match} */
    match = null;
    
    /** @type {string[]} */
    chats = [];
    
    
    /** @type {Account} */
    account = null;
    /** @type {Profile} */
    profile = null;
    /** @type {ISession} */
    session = null;
    
    // used internally in packet.ts
    /** @type {Buffer} */
    halfpack;
    /** @type {any[]} */
    packetQueue;
    
    // used internally in server.ts
    bindTCP;
    bindWS;
    
    /** @type {PlayerEntity} */
    entity = null;
    
    /** @type {number} */
    ping;
    
    room_join_timer = -1; // if >0 - joined a room recently, getting FULL entities list
    reconnect_timer = -1;
    
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
            this.profile.mmr = Math.max(_mmr, global.config.matchmaking.mmr_min);
    }
    
    constructor(socket, socket_type = 'tcp') {
        super();
        
        this.connected = true;
        
        // a random 8-digit number string
        this.temp_id = Math.floor(Math.random() * 100_000_000).toString();
        this.temp_id = '0'.repeat(8 - this.temp_id.length) + this.temp_id;
        
        this.socket = socket;
        this.socket_type = socket_type;
        
        this.lobby = null; // no lobby
        
        // these are the objects that contain all the meaningful data
        this.account = null; // account info
        this.profile = null; // gameplay info
        
        this.ping = -1;
        
        this.name = Names.getDefaultName();
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
    onLobbyReject(lobby, reason = 'lobby is full!') {
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
    
    onMatchFound(match) {
        this.match = match;
        this.sendMatchFound(match);
    }
    
    onGameOver(outcome, reason = '') {
        this.sendGameOver(outcome, reason);
    }
    
    onLogin() {
        if (this.profile.mmr === undefined) {
            this.profile.mmr = 1000;
        }
        
        this.profile.online = true;
        this.profile.last_online = new Date();
        this.name = this.profile.name;
        
        this.chatConnectAll();
        
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
        let room = null;
        
        // join the room last visited (saved in profile)
        if (global.config.room.use_last_profile_room && this.logged_in && this.profile.state.room) {
            room = this.lobby.findRoomByLevelName(this.profile.state.room);
        }
        // join the default starting room (from config)
        else if (global.config.room.use_starting_room && this.lobby.findRoomByLevelName(global.config.room.starting_room) !== undefined) {
            room = this.lobby.findRoomByLevelName(global.config.room.starting_room);
        }
        // join the first room in the lobby that isn't the current room?
        else {
            room = this.lobby.rooms[0];
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
        this.socket = null;
        this.connected = false;
        
        this.reconnect_timer = global.config.reconnect_timeout;
        
        this.matchMakingStop();
        
        // go offline
        if (this.logged_in) {
            this.profile.online = false;
            this.profile.last_online = new Date();
            this.save();
        }
    }
    
    onReconnect() {
        if (this.lobby)
            this.sendLobbyJoin(this.lobby);
        if (this.room && this.entity)
            this.sendPlay(this.lobby, this.room, this.entity.pos, this.entity.uuid);
        
        this.room_join_timer = global.config.room.recently_joined_timer;
    }
    
    
    disconnect() {
        if (this.socket === null) {
            return;
        }
        
        if (this.socket_type === 'ws') {
            this.socket.close();
        }
        else {
            this.socket.destroy();
        }
    }
    
    destroy() {
        // save everything to the DB
        this.save();
        
        this.matchMakingStop();
        
        // leave the lobby (if we're currently in one)
        if (this.lobby)
            this.lobby.kickPlayer(this, 'disconnect', true);
        if  (this.party)
            this.party.kickMember(this, 'disconnect', true);
        
        
        let idx = global.clients.indexOf(this);
        if (idx != -1)
            global.clients.splice(idx, 1);
        
        this.chatDisconnectAll();
        
        this.disconnect();
    }
    
    // move a new client's socket into this "dead" (disconnected) client
    // removes the other client from the global.clients list
    reconnect(new_client) {
        if (this.connected) {
            return;
        }
        
        this.connected = true;
        
        this.socket = new_client.socket;
        this.socket_type = new_client.socket_type;
        
        this.socket.removeAllListeners();
        
        if (this.socket_type === 'tcp')
            this.bindTCP(this.socket);
        else
            this.bindWS(this.socket);
        
        // delete self from the list
        let idx = global.clients.indexOf(new_client);
        if (idx != -1)
            global.clients.splice(idx, 1);
        
        this.onReconnect();
    }
    
    
    getInfo() {
        return {
            name: this.name,
            party_id: this.party?.party_id,
            lobby_id: this.lobby?.lobby_id,
            room_name: this.room?.level.name
        };
    }
    
    // Below are some preset functions (you probably don't want to change them
    
    
    lobbyJoin(lobby_id) {
        let lobby;
        if (lobby_id) {
            lobby = lobbyFind(lobby_id);
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
        
        return (await Profile.findById(this.profile.id).populate('friends')).friends;
    }
    
    async getFriendIds() {
        if (!this.logged_in)
            return [];
        
        return this.profile.friends;
    }
    
    async getIncomingFriendRequests() {
        if (!this.logged_in)
            return [];
        return await FriendRequest.findIncoming(this.profile.id);
    }
    
    async getOutgoingFriendRequests() {
        if (!this.logged_in)
            return [];
        return await FriendRequest.findOutgoing(this.profile.id);
    }
    
    async friendCanAdd(friend) {
        friend = friend instanceof Client ? friend.profile : friend;
        if (!this.logged_in)
            return false;
        
        let this_id = this.profile.id;
        let friend_id = friend.id;
        
        return this_id != friend_id && !(await this.getFriendIds()).includes(friend_id);
    }
    
    /**
     * Send a new friend request or accept an existing one from the user
     * @param friend {IProfile|Client}
     */
    async friendAdd(friend) {
        friend = friend instanceof Client ? friend.profile : friend;
        if (!this.logged_in)
            return false;
        if (!await this.friendCanAdd(friend))
            return false;
        
        let sender_id = this.profile.id;
        let receiver_id = friend.id;
        
        let friend_exists = this.profile.friends.some(friend_id => friend_id === receiver_id);
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
    async friendRequestSend(user_to) {
        user_to = user_to instanceof Client ? user_to.profile : user_to;
        if (!this.logged_in)
            return null;
        
        let sender = this.profile.id;
        let receiver = user_to.id;
        
        return await FriendRequest.create({ sender, receiver });
    }
    
    /**
     * @param {Client|IProfile} user_from
     * @param {Client|IProfile} user_to
     * @returns {Promise<IFriendRequest>}
     */
    async friendRequestFind(user_from, user_to) {
        user_from = user_from instanceof Client ? user_from.profile : user_from;
        user_to = user_to instanceof Client ? user_to.profile : user_to;
        
        return await FriendRequest.findRequestId(user_from.id, user_to.id);
    }
    
    /**
     * @param {Client|IProfile} user_from
     */
    async friendRequestAccept(user_from) {
        user_from = user_from instanceof Client ? user_from.profile : user_from;
        if (!this.logged_in)
            return false;
        
        // find a request FROM the user
        let inc_request_id = await this.friendRequestFind(user_from, this);
        if (inc_request_id) {
            await FriendRequest.accept(inc_request_id); // this method also updates the .friends arrays
            return true;
        }
        
        return false;
    }
    
    /**
     * @param {Client|IProfile} user_from
     */
    async friendRequestReject(user_from) {
        user_from = user_from instanceof Client ? user_from.profile : user_from;
        if (!this.logged_in)
            return false;
        
        // find a request FROM the user
        let inc_request_id = await this.friendRequestFind(user_from, this);
        if (inc_request_id) {
            await FriendRequest.reject(inc_request_id);
            return true;
        }
        
        return false;
    }
    
    /**
     * @param {Client|IProfile} user_to
     */
    async friendRequestCancel(user_to) {
        user_to = user_to instanceof Client ? user_to.profile : user_to;
        if (!this.logged_in)
            return false;
        
        // find a request from us TO the user
        let req_id = await this.friendRequestFind(this, user_to);
        if (req_id) {
            await FriendRequest.cancel(req_id);
            return true;
        }
        return false;
    }
    
    /**
     * @param {Client|IProfile} friend
     */
    async friendRemove(friend) {
        friend = friend instanceof Client ? friend.profile : friend;
        if (!this.logged_in)
            return false;
        
        let my_id = this.profile.id;
        let friend_id = friend.id;
        
        // delete from each others' profiles
        await Profile.findByIdAndUpdate(my_id, { $pull: { friends: friend_id } });
        await Profile.findByIdAndUpdate(friend_id, { $pull: { friends: my_id } });
        
        return true;
    }
    
    
    partyCreate() {
        if (this.party)
            this.partyLeave();
        this.party = partyCreate(this);
        return this.party;
    }
    
    partyLeave() {
        if (!this.party)
            return;
        
        this.party.kickMember(this);
    }
    
    partyInvite(user) {
        if (!this.party)
            this.partyCreate();
        // if (!this.party) return;
        
        user.sendPartyInvite(this.party);
        this.sendPartyInviteSent(user.name);
    }
    
    /**
     * @param {string} party_id
     */
    partyJoin(party_id) {
        this.matchMakingStop();
        
        let party = partyGet(party_id);
        party.addMember(this);
    }
    
    matchMakingStart(req) {
        if (this.ticket !== null)
            return 'already matchmaking';
        if (this.match)
            return 'already in a match';
        
        if (this.party) {
            let l = global.config.party.leader_only_mm;
            let canStartMM = !l || (l && this.party.isLeader(this));
            
            if (canStartMM) {
                return this.party.matchMakingStart(req);
            }
            else {
                return 'not a party leader';
            }
        }
        else { // solo q
            this.ticket = MatchMaker.createTicket(this, req);
            
            // failed to create a ticket
            if (this.ticket === null) {
                return 'unable to start matchmaking';
            }
            
            return this.ticket;
        }
    }
    
    matchMakingStop() {
        if (this.party)
            return this.party.matchMakingStop();
        else if (this.ticket === null)
            return;
        
        this.ticket.remove();
        this.ticket = null;
    }
    
    /**
     * Save account and profile data to the DB
     */
    async save() {
        if (this.account !== null) {
            await this.account.save()
                .then(() => {
                // trace('Saved the account successfully');
            })
                .catch((err) => {
                trace('Error while saving account: ' + err);
            });
        }
        if (this.profile !== null) {
            // save the current lobby_id
            if (this.lobby !== null) {
                this.profile.state.lobby_id = this.lobby.lobby_id;
            }
            
            await this.profile.save()
                .then(() => {
                // trace('Saved the profile successfully.');
            })
                .catch((err) => {
                trace('Error while saving profile: ' + err);
            });
        }
        if (this.session !== null) {
            await this.session.save()
                .then(() => {
                // trace('Saved the session successfully');
            })
                .catch((err) => {
                trace('Error while saving session: ' + err);
            });
        }
    }
    
    /**
     * @param {Account} account
     */
    async register(account) {
        account.temporary = false;
        
        this.account = account;
        this.profile = profileCreate(account);
        
        await this.account.save();
        await this.profile.save();
        
        this.onLogin();
    }
    
    /**
     * @param {Account} account
     */
    async login(account) {
        this.account = account;
        
        this.profile = await Profile.findOne({
            account_id: this.account.id
        });
        
        this.onLogin();
    }
    
    
    chatJoin(chat_id) {
        if (!this.profile)
            return;
        
        let chat = chatFind(chat_id);
        if (chat) {
            chat.addMember(this.profile, this);
        }
    }
    
    chatLeave(chat_id) {
        if (!this.profile)
            return;
        
        let chat = chatFind(chat_id);
        if (chat) {
            chat.kickMember(this.profile);
        }
    }
    
    chatConnectAll() {
        if (!this.profile)
            return;
        
        this.profile.chats.forEach(chat_id => {
            let chat = chatFind(chat_id);
            chat?.connectMember(this);
        });
    }
    
    chatDisconnectAll() {
        this.chats.forEach(chat => {
            chat.disconnectMember(this);
        });
    }
}
