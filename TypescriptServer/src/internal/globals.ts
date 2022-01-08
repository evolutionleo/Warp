import Client from '#concepts/client'
import GameMap from '#concepts/map'
import Lobby from '#concepts/lobby'
import { EntityType } from '#concepts/entity'

declare global {
    namespace NodeJS {
        interface Global {
            clients:Client[];
            maps:GameMap[];
            lobbies:{[index: string]: Lobby};
            entities:EntityType[];

            entityNames:{[key: string]: EntityType}; // type -> EntityType
            entityObjects:{[key: string]: EntityType}; // object_name -> EntityType

            ping_interval:Timeout
        }
    }
}

// for some reason this dumb file breaks for gulp-typescript when I make it a .d.ts file
// also this file is for linting only, so it should be empty in JS output lol