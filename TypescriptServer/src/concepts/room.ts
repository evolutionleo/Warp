import trace from '#util/logging';
import Client from '#concepts/client';
import Entity, { SerializedEntity } from '#concepts/entity';
import { EntityConstructor, PlayerEntityConstructor } from '#concepts/entity';
import { System } from 'detect-collisions';

import PlayerEntity from '#entities/player';
import GameLevel, { LevelInfo, levelFind } from '#concepts/level';
import { EventEmitter } from 'events';
import Lobby from '#concepts/lobby';
import chalk from 'chalk';
import UnknownEntity from '#entities/unknown';

export type RoomEvent = 'tick' | 'spawn' | 'player leave' | 'player join' | 'close';

export type SerializedRoom = {
    entities: SerializedEntity[],
    level: GameLevel,
    player_count: number
};

export type RoomInfo = {
    level: LevelInfo,
    player_count: number
}

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
        return this.filter(e => e.is_solid);
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

    tick_counter:number = 0; // counts 

    width:number;
    height:number;

    level:GameLevel;

    full_bundle:any[] = []; // all the entities packed
    bundle:any[] = []; // updated entities that need sending

    rest_timeout:number = 0; // disables processing entities when no players are present for config.room_rest_timeout *seconds*

    last_tick_time: number = 0;
    dt: number = 0;

    constructor(level:GameLevel|string, lobby:Lobby) {
        super();
        this.lobby = lobby;

        // if provided with a string -
        if (typeof level === 'string') {
            // find a level with this name
            this.level = levelFind(level);

            if (this.level === undefined) {
                trace(`Error: could not find a level with the name "${level}"`);
                this.close();
                return;
            }
        }
        else { // otherwise - just set the level directly
            this.level = level;
        }

        this.width = this.level.width;
        this.height = this.level.height;
        
        // this.tree = new MyRBush(7);
        this.tree = new System();


        setInterval(this.tick.bind(this), 1000 / this.tickrate);
        this.unwrap(this.level.contents); // || '[]');
    }

    // create entities from the contents string
    unwrap(contents:string|SerializedEntity[] = '[]'):void {
        let entities:SerializedEntity[];
        if (typeof contents === 'string') {
            entities = JSON.parse(contents);
        }
        else if (Array.isArray(contents)) {
            entities = contents;
        }
        else {
            console.error('error unwrapping room contents - unknown type ' + typeof contents + " (string or array expected)");
            return;
        }

        entities.forEach(entity => {
            const etype = global.entity_names[entity.t];
            if (etype.type == UnknownEntity.type) { // entity type doesn't exist
                if (global.config.room.warn_on_unknown_entity) {
                    trace(chalk.yellowBright('Warning: Entity of object type "' + entity.obj + '" not found!'));
                }
                return;
            }

            const e = this.spawnEntity(etype, entity.x, entity.y);
            e.xscale = entity.xs;
            e.yscale = entity.ys;

            e.regenerateCollider();
            for (let key in entity.p) {
                let value = entity.p[key];
                // warn about name collisions
                // if (e[key] !== undefined) {
                // if (key in Object.getOwnPropertyNames(PhysicsEntity)) {
                    // throw "Collision in props: entity of type " + e.type + " already has a variable called " + key + "!";
                // }
                if (!e.prop_names.includes(key))
                    e.prop_names.push(key);
                e[key] = value;
            }
        });
    }
    
    tick():void {
        let t_beforeTick = Date.now(); // measure the tick time
        if (global.config.dt_enabled) {
            this.dt = (t_beforeTick - this.last_tick_time) / 1000;
        }
        else {
            this.dt = 1;
        }
        this.last_tick_time = Date.now();

        // don't process entities
        if (this.players.length === 0) {
            this.rest_timeout += 1 / this.tickrate;
            if (global.config.room.rest_timeout >= 0 // if this is enabled
                && this.rest_timeout > global.config.room.rest_timeout) {
                // do nothing - don't update the entities
                return;
            }
        }
        else { // reset the timer and wake up
            this.rest_timeout = 0;
        }

        // this.tree.search({ minX: 0, minY: 0, maxX: 0, maxY: 0 });

        this.bundle = []; // the updated ones
        this.full_bundle = []; // all the entities in the room

        this.tick_counter++; // increment the current tick/frame counter

        this.entities.forEach(entity => {
            entity.update(this.dt);
            this.full_bundle.push(entity.bundle());
        });
        this.emit('tick');

        // broadcast
        let bundle = { cmd: 'entities', room: this.level.room_name, full: false, entities: this.bundle };
        let full_bundle = { cmd: 'entities', room: this.level.room_name, full: true, entities: this.full_bundle };

        this.players.forEach(player => {
            // we will send everything every frame to those who joined recently (so that they 100% get it)
            if (player.room_join_timer > 0) {
                player.send(full_bundle);
                player.room_join_timer--;
            }
            // broadcast the min bundle (only changed entities) to everyone else
            else if (this.bundle.length > 0)
                player.send(bundle);
        });


        let t_afterTick = Date.now(); // measure the tick time in ms
        let t_tick = t_afterTick - t_beforeTick;

        // we are lagging!
        if (global.config.verbose_lag && t_tick > (1000 / this.tickrate)) {
            trace(chalk.red('lag detected: this tick took ' + t_tick + ' milliseconds.'));
        }
    }

    // entity stuff
    spawnEntity(etype:PlayerEntityConstructor, x:number, y:number, client?:Client): PlayerEntity;
    spawnEntity(etype:EntityConstructor, x:number, y:number, client?:Client): Entity {
        if (!global.config.entities_enabled) {
            console.error("Warning: Spawning entities is disabled globally! Room.spawnEntity() returning null. You can change this in config.js/ts");
            return null;
        }


        if (client === null) {
            var entity = new etype(this, x, y);
        }
        else {
            var entity = new (etype as PlayerEntityConstructor)(this, x, y, client);
        }

        entity.create();
        this.entities.push(entity);

        entity.on('death', () => {
            this.broadcast({ cmd: 'entity death', id: entity.uuid, obj: entity.object_name });
        });

        entity.on('remove', () => {
            this.broadcast({ cmd: 'entity remove', id: entity.uuid, obj: entity.object_name });
        });

        this.emit('spawn', entity);

        return entity;
    }

    // player manipulation
    removePlayer(player:Client):void {
        // remove from this.players
        let idx = this.players.indexOf(player);
        if (idx !== -1)
            this.players.splice(idx, 1);
        
        player.room = null;
        if (player.entity !== null) {
            player.entity.remove();
            player.entity = null;
        }
        this.emit('player leave', player);
        // this.broadcast({ cmd: 'player leave', player: player });
    }

    addPlayer(player:Client):void {
        this.players.push(player);
        player.room = this;

        if (player.logged_in) player.profile.state.room = this.level.name;

        // create a player entity
        if (global.config.entities_enabled) {
            // determine the coords
            let x:number, y:number;
        
            // load the last recorded position from the db
            if (global.config.room.use_persistent_position && player.logged_in) {
                x = player.profile.state.x;
                y = player.profile.state.y;
            }
            // find a new start position
            else {
                const p = this.level.getStartPos(this.players.length-1);
                x = p.x;
                y = p.y;
            }

            // spawn the entity
            const player_entity = this.spawnEntity(PlayerEntity, x, y, player);
            player.entity = player_entity;
        }
        // add to the recently joined list to receive the old entities
        player.room_join_timer = global.config.room.recently_joined_timer * global.config.tps;
        
        this.emit('player join', player);
    }

    // move between rooms
    movePlayer(player:Client, new_room:Room):void {
        this.removePlayer(player);
        new_room.addPlayer(player);

        player.sendRoomTransition(new_room, player.entity.pos, player.entity.uuid);
    }

    broadcast(packet:object) {
        this.players.forEach(player => {
            player.write(packet);
        });
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
            level: this.level,
            entities: this.entities.map(e => e.serialize())
        };
    }

    getInfo():RoomInfo {
        return {
            player_count: this.players.length,
            level: this.level.getInfo()
        }
    }
}



export default Room;