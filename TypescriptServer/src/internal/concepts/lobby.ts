import trace from '#util/logging';
import GameMap from '#concepts/map';
import Client from '#concepts/client';
import Room, { SerializedRoom, RoomInfo }  from '#concepts/room';
import { EventEmitter } from 'events';

export type LobbyStatus = 'open' | 'closed';

// note: only create lobbies with createLobby(), don't call the constructor directly


export type SerializedLobby = {
    lobbyid: string,
    status: LobbyStatus,
    max_players: number,
    player_count: number,
    rooms: SerializedRoom[],
    full: boolean
}

export type LobbyInfo = {
    lobbyid: string,
    status: LobbyStatus,
    max_players: number,
    player_count: number,
    rooms: RoomInfo[],
    full: boolean
}

// in context of an MMO this is a shard/separated world
export default class Lobby extends EventEmitter {
    lobbyid:string = "-1"; // assigned when created
    status:LobbyStatus = 'open';
    players:Client[] = [];
    rooms:Room[] = [];
    max_players:number = global.config.lobby.max_players || undefined; // smells like Java

    constructor() {
        super();

        if (global.config.rooms_enabled) {
            for(let i = 0; i < global.maps.length; i++) {
                let map = global.maps[i];
                let room = new Room(map, this);
                this.rooms.push(room);
            }
        }
        else {
            this.rooms = null;
        }
    }

    addPlayer(player:Client):void|-1 {
        if (this.full) {
            trace('warning: can\'t add a player - the lobby is full!');
            player.onRejectLobby(this, 'lobby is full!');
            return -1;
        }
        else if (this.players.indexOf(player) !== -1) {
            trace('warning: can\'t add a player who\'s already in the lobby');
            player.onRejectLobby(this, 'already in the lobby');
            return -1;
        }
        else if (player.lobby !== null) {
            player.lobby.kickPlayer(player, 'changing lobbies', false);
        }
        else if (global.config.necessary_login && player.profile === null) {
            trace('warning: can\'t add a player who\'s not logged in');
            player.onRejectLobby(this, 'login to join a lobby!');
            return -1;
        }

        this.players.push(player);
        player.lobby = this;
        player.onJoinLobby(this);

        
        // lobby is now full - add everyone
        if (global.config.lobby.addIntoPlayOnFull && this.players.length == this.max_players) {
            this.players.forEach(p => this.addIntoPlay(p));
        }
        else if (!global.config.lobby.addIntoPlayOnFull) {
            // immediately add into play
            this.addIntoPlay(player);
        }
    }

    kickPlayer(player:Client, reason?:string, forced?:boolean):void {
        var idx = this.players.indexOf(player);
        this.players.splice(idx, 1);
        player.room?.removePlayer(player); // if in a room - kick, otherwise don't error out
        player.onKickLobby(this, reason, forced);
        player.lobby = null;


        // close if a player leaves from the lobby?
        if (global.config.lobby.closeOnLeave) {
            this.close();
        }
    }

    addIntoPlay(player:Client):void {
        if (player.lobby === this) {
            player.onPlay();
        }
        else {
            trace('something went wrong - trying to add into play a player not from this lobby');
        }
    }

    broadcast(data:object):void {
        this.players.forEach(function(player) {
            player.write(data);
        })
    }

    play():void {
        var lobby = this;
        this.players.forEach(function(player) {
            lobby.addIntoPlay(player);
        })
    }

    close():void {
        // kick all plaayers
        this.players.forEach((player) => this.kickPlayer(player, 'lobby is closing!', true));
        this.status = 'closed';
    }


    // data that is being sent about this lobby
    // (e.x. we don't want to send functions and everything about every player)
    serialize():SerializedLobby {
        return {
            lobbyid: this.lobbyid,
            rooms: global.config.rooms_enabled
                ? this.rooms.map(r => r.serialize())
                : undefined,
            status: this.status,
            max_players: this.max_players,
            player_count: this.player_count,
            full: this.full
        }
    }

    getInfo():LobbyInfo {
        return {
            lobbyid: this.lobbyid,
            rooms: global.config.rooms_enabled
                ? this.rooms.map(r => r.getInfo())
                : undefined,
            status: this.status,
            max_players: this.max_players,
            player_count: this.player_count,
            full: this.full
        }
    }

    get player_count():number {
        return this.players.length;
    }

    get full():boolean {
        return this.player_count >= this.max_players;
    }

    get empty():boolean {
        return this.player_count == 0;
    }
}