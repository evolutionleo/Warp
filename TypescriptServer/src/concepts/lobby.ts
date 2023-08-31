import trace from '#util/logging';
import GameLevel from '#concepts/level';
import Client from '#concepts/client';
import Room, { SerializedRoom, RoomInfo }  from '#concepts/room';
import { EventEmitter } from 'events';
import * as crypto from 'crypto';
import GameMode from '#concepts/game_mode';
import GameMap, { GameMapInfo } from './map';



// note: only create lobbies with createLobby(), don't call the constructor directly
export function lobbyCreate(map:GameMap) { // returns the lobby instance
    var lobby = new Lobby(map);

    while(true) {
        // a random 6-digit number
        var lobbyid = crypto.randomInt(100000, 999999).toString();
        if (lobbyid in global.lobbies) { // just in case of a collision
            continue;
        }
        else {
            global.lobbies[lobbyid] = lobby;
            lobby.lobbyid = lobbyid;
            break;
        }
    }
    
    return lobby;
}

export function lobbyGet(lobbyid:string) {
    return global.lobbies[lobbyid];
}

export function lobbyExists(lobbyid:string) {
    return global.lobbies.hasOwnProperty(lobbyid);
}

export function lobbyDelete(lobbyid:string) {
    var lobby = global.lobbies[lobbyid];
    lobby.close();

    delete global.lobbies[lobbyid];
}

export function lobbyList():Lobby[] {
    return (Object.values(global.lobbies)) as Lobby[];
}


export type LobbyStatus = 'open' | 'closed';

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
    full: boolean,
    map: GameMapInfo
}


// in context of an MMO this is a shard/separated world
export default class Lobby extends EventEmitter {
    lobbyid:string = '-1'; // assigned when created
    status:LobbyStatus = 'open';
    /** @type {Client[]} */
    players:Client[] = [];
    /** @type {Room[]} */
    rooms:Room[] = [];

    map:GameMap = null;
    game_mode:GameMode = null;

    // used when creating a lobby with no map/game mode
    max_players:number = global.config.lobby.max_players || undefined;


    /** @type {Client[][]} */
    teams: Client[][] = [];

    constructor(map:GameMap = null) {
        super();

        this.map = map;

        if (global.config.rooms_enabled && this.map !== null) {
            for(let i = 0; i < this.map.levels.length; i++) {
                let level = this.map.levels[i];
                let room = new Room(level, this);
                this.rooms.push(room);
            }
        }
        else {
            this.rooms = null;
        }
    }

    /**
     * @param {Client} player
     * @returns {void|-1}
     */
    addPlayer(player:Client):void|-1 {
        if (this.full) {
            trace('warning: can\'t add a player - the lobby is full!');
            player.onLobbyReject(this, 'lobby is full!');
            return -1;
        }
        else if (this.players.indexOf(player) !== -1) {
            trace('warning: can\'t add a player who\'s already in the lobby');
            player.onLobbyReject(this, 'already in the lobby');
            return -1;
        }
        else if (player.lobby !== null) {
            player.lobby.kickPlayer(player, 'changing lobbies', false);
        }
        else if (global.config.necessary_login && !player.logged_in) {
            trace('warning: can\'t add a player who\'s not logged in');
            player.onLobbyReject(this, 'login to join a lobby!');
            return -1;
        }

        this.players.push(player);
        player.lobby = this;
        player.onLobbyJoin(this);

        
        // lobby is now full - add everyone
        if (global.config.lobby.add_into_play_on_full && this.players.length == this.max_players) {
            this.play();
        }
        else if (global.config.lobby.add_into_play_on_join) {
            // immediately add into play
            this.addIntoPlay(player);
        }
    }

    /**
     * @param {Client} player
     * @param {string?} reason
     * @param {boolean?} forced
     */
    kickPlayer(player:Client, reason?:string, forced?:boolean):void {
        var idx = this.players.indexOf(player);
        this.players.splice(idx, 1);
        player.room?.removePlayer(player); // if in a room - kick, otherwise don't error out
        player.onLobbyLeave(this, reason, forced);
        player.lobby = null;


        // close if a player leaves from the lobby?
        if (global.config.lobby.close_on_leave) {
            this.close();
        }
    }

    /**
     * @param {Client} player
     */
    addIntoPlay(player:Client):void {
        if (player.lobby === this) {
            player.onPlay();
        }
        else {
            trace('something went wrong - trying to add a player from another lobby into play');
        }
    }

    /**
     * @param {string} room_name
     * @returns {Room} room
     */
    findRoomByLevelName(room_name:string):Room {
        return this.rooms.find(r => r.level.name === room_name);
    }

    /**
     * @param {object} data
     */
    broadcast(data:object):void {
        this.players.forEach((player) => {
            player.write(data);
        });
    }

    // add everyone into play
    play():void {
        this.players.forEach((player) => {
            this.addIntoPlay(player);
        });
    }

    close(reason:string = 'lobby is closing!'):void {
        // kick all players
        this.players.forEach((player) => this.kickPlayer(player, reason, true));
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
            full: this.full,

            map: this.map.getInfo()
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