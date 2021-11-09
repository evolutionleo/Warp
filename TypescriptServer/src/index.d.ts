import Client from '#concepts/client'
import GameMap from '#concepts/map'
import Entity, {EntityType} from '#concepts/entity'
import Lobby from '#concepts/lobby'

declare global {
    namespace NodeJS {
        interface Global {
            clients:Client[];
            maps:GameMap[];
            lobbies:{[index: string]: Lobby};
            entities:EntityType[];

            entityNames:{[key: string]: EntityType}; // type -> EntityType
            entityObjects:{[key: string]: EntityType}; // object_name -> EntityType
        }
    }
}


declare const clients:Client[];
declare const maps:GameMap[];
declare const lobbies:{[index: string]: Lobby};
declare const entities:EntityType[];

declare const entityNames:{[key: string]: EntityType};
declare const entityObjects:{[key: string]: EntityType};