import Client from '#concepts/client'
import GameMap from '#concepts/map'
import Lobby from '#concepts/lobby'
import { EntityType } from '#concepts/entity'
import Party from '#concepts/party';

declare global {
    namespace NodeJS {
        interface Global {
            clients:Client[];
            maps:GameMap[];
            lobbies:{[key: string]: Lobby};
            parties:{[key: string]: Party};
            entities:EntityType[];

            entity_names:{[key: string]: EntityType}; // type -> EntityType
            entity_objects:{[key: string]: EntityType}; // object_name -> EntityType

            ping_interval:Timeout;
            start_time:number;
        }
    }
}

// for some reason this dumb file breaks for gulp-typescript when I make it a .d.ts file
// also this file is for linting only, so it should be empty in JS output lol