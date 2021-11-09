import Room from '#concepts/room';
import { EventEmitter } from 'events';
// in context of an MMO this is a shard/separated world
export default class Lobby extends EventEmitter {
    constructor() {
        super();
        this.lobbyid = "-1"; // assigned when created
        this.status = 'open';
        this.players = [];
        this.rooms = [];
        this.max_players = global.config.lobby.max_players || undefined; // smells like Java
        for (let i = 0; i < global.maps.length; i++) {
            let map = global.maps[i];
            let room = new Room(map, this);
            this.rooms.push(room);
        }
    }
    addPlayer(player) {
        if (this.full) {
            console.log('warning: can\'t add a player - the lobby is full!');
            player.onRejectLobby(this, 'lobby is full!');
            return -1;
        }
        else if (this.players.indexOf(player) !== -1) {
            console.log('warning: can\'t add a player who\'s already in the lobby');
            player.onRejectLobby(this, 'already in the lobby');
            return -1;
        }
        else if (player.lobby !== null) {
            player.lobby.kickPlayer(player, 'changing lobbies', false);
        }
        else if (player.profile === null) {
            console.log('warning: can\'t add a player who\'s not logged in');
            player.onRejectLobby(this, 'login to join a lobby!');
            return -1;
        }
        this.players.push(player);
        player.lobby = this;
        player.onJoinLobby(this);
        // immediately add into play
        this.addIntoPlay(player);
    }
    kickPlayer(player, reason, forced) {
        var idx = this.players.indexOf(player);
        this.players.splice(idx, 1);
        player.room?.removePlayer(player);
        player.onKickLobby(this, reason, forced);
        player.lobby = null;
    }
    addIntoPlay(player) {
        if (player.lobby === this) {
            // var room = this.rooms.find(room => room.map.name == player.profile.room);
            player.onPlay();
        }
        else {
            console.log('something went wrong - trying to add into play a player not from this lobby');
        }
        // var idx = global.clients.indexOf(player);
        // var start_pos = this.map.getStartPos(idx);
        // player.onPlay(this, start_pos);
    }
    broadcast(data) {
        this.players.forEach(function (player) {
            player.write(data);
        });
    }
    play() {
        var lobby = this;
        this.players.forEach(function (player) {
            lobby.addIntoPlay(player);
        });
    }
    close() {
        // kick all plaayers
        this.players.forEach((player) => this.kickPlayer(player, 'lobby is closing!', true));
        this.status = 'closed';
    }
    // data that is being sent about this lobby
    // (e.x. we don't want to send functions and everything about every player)
    serialize() {
        return {
            lobbyid: this.lobbyid,
            status: this.status,
            max_players: this.max_players,
            player_count: this.player_count,
            full: this.full
        };
    }
    get player_count() {
        return this.players.length;
    }
    get full() {
        return this.player_count >= this.max_players;
    }
    get empty() {
        return this.player_count == 0;
    }
}
