import trace from '#util/logging';
import Client from '#concepts/client';
import GameMap from '#concepts/map';
import Lobby from '#concepts/lobby';
import Entity, { EntityType } from '#concepts/entity';

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

global.clients = [];
global.maps = [];           // loaded in 02_maps.js
global.entities = [];       // loaded in 03_entities.js
global.entityNames = {};
global.entityObjects = {};
global.lobbies = {};        // loaded in 04_lobbies.js 

export {}