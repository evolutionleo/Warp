import Client from '#entities/client';
import GameMap from '#entities/map';
import Lobby from '#entities/lobby';

declare global {
    namespace NodeJS {
        interface Global {
            clients:Client[];
            maps:GameMap[];
            lobbies:{[index: string]: Lobby};
        }
    }
}

global.clients = [];
global.maps = [];    // loaded in 01_maps.js
global.lobbies = {}; // loaded in 02_lobbies.js

export {}