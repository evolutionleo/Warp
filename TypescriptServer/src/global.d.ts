import Client from '#concepts/client'
import GameLevel from '#concepts/level'
import Lobby from '#concepts/lobby'
import { EntityType } from '#concepts/entity'
import Party from '#concepts/party';
import { Config } from '#root/config';
import GameMode from '#concepts/game_mode';
import GameMap from '#concepts/map';

declare global {
    var config:Config;

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

// for some reason this dumb file breaks for gulp-typescript when I make it a .d.ts file
// also this file is for linting only, so it should be empty in JS output lol