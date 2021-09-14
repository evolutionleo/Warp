import trace from '#internal/logging';

import GameMap from '#entities/map';
import Client from '#entities/client';

type LobbyStatus = 'waiting' | 'playing' | 'closed'

// note: only create lobbies with createLobby(), don't call the constructor directly
export default class Lobby {
    lobbyid:string = "-1"; // assigned when created
    map:GameMap = undefined;
    status:LobbyStatus = 'waiting';
    players:Client[] = [];
    max_players:number = undefined;

    constructor(map:string|GameMap) {
        // if provided a string -
        if (typeof map === 'string') {
            // find a map with the name
            this.map = global.maps.find(function(_map) {
                return _map.name === map;
            })

            if (this.map === undefined) {
                trace(`Error: could not find a map called "${map}"`);
                this.close();
                return;
            }
        }
        else { // otherwise - just set the map
            this.map = map;
        }

        this.status = 'waiting';
        this.max_players = this.map.max_players;
    }

    updateStatus():void {
        if (this.full) {
            this.status = 'playing';
            this.play();
        }
        if (this.empty) {
            this.status = 'waiting';
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

        this.players.push(player);
        player.lobby = this;
        player.onJoinLobby(this);

        this.updateStatus();
    }

    kickPlayer(player:Client, reason?:string, forced?:boolean):void {
        var idx = this.players.indexOf(player);
        this.players.splice(idx, 1);
        // todo: maybe send some command to the client
        player.onKickLobby(this, reason, forced);
        player.lobby = null;

        this.updateStatus();
    }

    addIntoPlay(player:Client):void {
        var idx = global.clients.indexOf(player);
        var start_pos = this.map.getStartPos(idx);
        player.onPlay(this, start_pos);
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
    serialize():object {
        return {
            lobbyid: this.lobbyid,
            map: this.map,
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