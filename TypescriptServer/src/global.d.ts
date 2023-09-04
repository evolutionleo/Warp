import Client from '#concepts/client'
import GameLevel from '#concepts/level'
import Lobby from '#concepts/lobby'
import { EntityType } from '#concepts/entity'
import Party from '#concepts/party';
import { Config } from '#root/config';
import GameMode from '#concepts/game_mode';
import GameMap from '#concepts/map';
import MatchMaker from '#matchmaking/matchmaker';

declare global {
    var config:Config;
    var matchmaker:typeof MatchMaker;

    var clients:Client[];
    var levels:{[key:string]: GameLevel};
    var lobbies:{[key: string]: Lobby};
    var parties:{[key: string]: Party};
    var entities:EntityType[];
    var game_modes:{[key:string]: GameMode};
    var maps:GameMap[];

    var entity_names:{[key: string]: EntityType}; // type -> EntityType
    var entity_objects:{[key: string]: EntityType}; // object_name -> EntityType

    var ping_interval:NodeJS.Timer;
    var start_time:number;
}

export {}