import trace from '#util/logging';
import Client from '#concepts/client';
import Entity, { SerializedEntity } from '#concepts/entity';
import { EntityConstructor, PlayerEntityConstructor } from '#concepts/entity';
import { System, Circle, Polygon } from 'detect-collisions';

// let sys = new System();
// let s = new Polygon({ x: 0, y: 0}, [{x: 0, y: 0}, {x: 10, y: 0 }, {x: 10, y: 10}, {x: 0, y: 10}])
// sys.insert(s);

import PlayerEntity from '#entities/entity_types/player';
import GameMap from '#concepts/map';
import { EventEmitter } from 'events';
import Lobby from '#concepts/lobby';
import RBush from 'rbush';

export class MyRBush extends RBush<Entity> {
    toBBox(e:Entity) { return e.bbox; }
    compareMinX(a:Entity, b:Entity) { return a.bbox.left - b.bbox.left; }
    compareMinY(a:Entity, b:Entity) { return a.bbox.top - b.bbox.top; }
}


// import { entityNames } from '#entities/_entities';

export type RoomEvent = 'tick' | 'spawn' | 'player leave' | 'player join' | 'close';

export type SerializedRoom = {
    entities: SerializedEntity[],
    map: GameMap,
    player_count: number
};

const tickrate = global.config.tps || 60;

export class EntityList extends Array<Entity> {
    filterByType(type:string) {
        return this.filter(e => e.type === type);
    }

    ofType(type:string) {
        return this.filterByType(type);
    }

    // returns only the solid 
    solid() {
        return this.filter(e => e.isSolid);
    }

    withTag(tag:string) {
        return this.filter(e => e.hasTag(tag));
    }
}


interface Room {
    on(event:RoomEvent, callback:(...args:any[])=>void):this;
}

class Room extends EventEmitter {
    lobby:Lobby;
    tickrate:number = tickrate;
    entities:EntityList/*Entity[]*/ = new EntityList();
    tree:System;
    players:Client[] = [];
    recentlyJoined:[Client, number][] = [];
    recentlyJoinedTimer = 120; // 2 seconds?

    width:number;
    height:number;

    map:GameMap;

    constructor(map:GameMap|string, lobby:Lobby) {
        super();
        this.lobby = lobby;

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

        this.width = this.map.width;
        this.height = this.map.height;
        
        // this.tree = new MyRBush(7);
        this.tree = new System();


        setInterval(this.tick.bind(this), 1000 / this.tickrate);
        this.unwrap(this.map.contents); // || '[]');
    }

    // create entities from the contents string
    unwrap(contents:string|SerializedEntity[] = '[]'):void {
        if (typeof contents === 'string') {
            const entities:SerializedEntity[] = JSON.parse(contents);
    
            entities.forEach(entity => {
                const etype = global.entityNames[entity.type];
                // trace(etype);
                const e = this.spawnEntity(etype, entity.x, entity.y);
                e.xscale = entity.xscale;
                e.yscale = entity.yscale;

                e.regenerateCollider();
            });
            
        }
        else if (Array.isArray(contents)) {
            contents.forEach(entity => {
                const etype = global.entityNames[entity.type];
                // trace(etype);
                const e = this.spawnEntity(etype, entity.x, entity.y);
                e.xscale = entity.xscale;
                e.yscale = entity.yscale;

                e.regenerateCollider();
            });
        }
        else {
            console.error('error unwrapping room contents - unknown type');
        }


        // bulk load all the entities
        // this.tree.load(this.entities.filter(e => e.isSolid).map(e => e.shape));
    }
    
    tick():void {
        this.entities.forEach(entity => {
            entity.update();
            this.recentlyJoined.forEach(([player, _]) => entity.send(player));
        });
        this.emit('tick');

        // we will send everything every frame to those who joined recently (so that they 100% get it)
        this.recentlyJoined.map((player, timer) => [player, timer-1]);
        this.recentlyJoined.filter(([player, timer]) => {
            return timer > 0;
        });
    }

    // entity stuff
    spawnEntity(etype:PlayerEntityConstructor, x:number, y:number, client?:Client): PlayerEntity;
    spawnEntity(etype:EntityConstructor, x:number, y:number, client?:Client): Entity {
        if (client === null) {
            var entity = new etype(this, x, y);
        }
        else {
            var entity = new (etype as PlayerEntityConstructor)(this, x, y, client);
        }

        entity.create();
        this.entities.push(entity);

        entity.on('death', () => {
            this.broadcast({ cmd: 'entity death', id: entity.uuid });
        });

        entity.on('remove', () => {
            this.broadcast({ cmd: 'entity remove', id: entity.uuid });
        });

        this.emit('spawn', entity);

        return entity;
    }

    // player manipulation
    removePlayer(player:Client):void {
        this.players.splice(this.players.indexOf(player));
        player.room = null;
        // var player_entity = this.entities.find((entity) => {
        //     return (entity instanceof PlayerEntity) && (entity as PlayerEntity).client === player;
        // });
        player.entity.remove();
        this.emit('player leave', player);
        // this.broadcast({ cmd: 'player leave', player: player });
    }

    addPlayer(player:Client):void {
        this.players.push(player);
        player.room = this;
        
        let x:number, y:number;

        // load the position from the db - uncomment if you want persistent position
        // if (player.profile) {
        //     x = player.profile.x;
        //     y = player.profile.y;
        // }
        // else {

        // }
        const p = this.map.getStartPos(this.players.length-1);
        x = p.x;
        y = p.y;
        const player_entity = this.spawnEntity(PlayerEntity, x, y, player);
        player.entity = player_entity;
        // send all the existing entities to the player
        this.entities.forEach(entity => {
            entity.send(player);
        });
        this.recentlyJoined.push([ player, this.recentlyJoinedTimer ]);
        
        this.emit('player join', player);
    }

    // move between rooms
    movePlayer(player:Client, new_room:Room):void {
        this.removePlayer(player);
        new_room.addPlayer(player);
    }

    broadcast(packet:object) {
        this.players.forEach(player => {
            player.write(packet);
        })
    }

    close():void {
        this.emit('close');
        this.broadcast({cmd: 'room kick', message: 'Room is closing'});
        while(this.players.length > 0) {
            this.removePlayer(this.players[0]);
        }
    }

    serialize():SerializedRoom {
        return {
            player_count: this.players.length,
            map: this.map,
            entities: this.entities.map(e => e.serialize())
        };
    }
}



export default Room;