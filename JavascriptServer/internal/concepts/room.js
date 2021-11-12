import trace from '#util/logging';
import PlayerEntity from '#entities/entity_types/player';
import { EventEmitter } from 'events';
import RBush from 'rbush';
class MyRBush extends RBush {
    toBBox(e) { return e.bbox; }
    compareMinX(a, b) { return a.bbox.left - b.bbox.left; }
    compareMinY(a, b) { return a.bbox.top - b.bbox.top; }
}
const tickrate = global.config.tps || 60;
export class EntityList extends Array {
    filterByType(type) {
        return this.filter(e => e.type === type);
    }
    ofType(type) {
        return this.filterByType(type);
    }
    // returns only the solid 
    solid() {
        return this.filter(e => e.isSolid);
    }
    withTag(tag) {
        return this.filter(e => e.hasTag(tag));
    }
}
class Room extends EventEmitter {
    constructor(map, lobby) {
        super();
        this.tickrate = tickrate;
        this.entities = new EntityList();
        this.players = [];
        this.recentlyJoined = [];
        this.recentlyJoinedTimer = 120; // 2 seconds?
        this.lobby = lobby;
        // if provided a string -
        if (typeof map === 'string') {
            // find a map with the name
            this.map = global.maps.find(function (_map) {
                return _map.name === map;
            });
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
        this.tree = new MyRBush();
        setInterval(this.tick.bind(this), 1000 / this.tickrate);
        this.unwrap(this.map.contents); // || '[]');
    }
    // create entities from the contents string
    unwrap(contents = '[]') {
        if (typeof contents === 'string') {
            const entities = JSON.parse(contents);
            entities.forEach(entity => {
                const etype = global.entityNames[entity.type];
                // trace(etype);
                this.spawnEntity(etype, entity.x, entity.y);
            });
        }
        else if (Array.isArray(contents)) {
            contents.forEach(entity => {
                const etype = global.entityNames[entity.type];
                // trace(etype);
                const e = this.spawnEntity(etype, entity.x, entity.y);
                e.xscale = entity.xscale;
                e.yscale = entity.yscale;
            });
        }
        else {
            console.error('error unwrapping room contents - unknown type');
        }
        // bulk load all the entities
        this.tree.load(this.entities.filter(e => e.isSolid));
    }
    tick() {
        this.entities.forEach(entity => {
            entity.update();
            this.recentlyJoined.forEach(([player, _]) => entity.send(player));
        });
        this.emit('tick');
        // we will send everything every frame to those who joined recently (so that they 100% get it)
        this.recentlyJoined.map((player, timer) => [player, timer - 1]);
        this.recentlyJoined.filter(([player, timer]) => {
            return timer > 0;
        });
    }
    spawnEntity(etype, x, y, client) {
        if (client === null) {
            var entity = new etype(this, x, y);
        }
        else {
            var entity = new etype(this, x, y, client);
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
    removePlayer(player) {
        this.players.splice(this.players.indexOf(player));
        player.room = null;
        // var player_entity = this.entities.find((entity) => {
        //     return (entity instanceof PlayerEntity) && (entity as PlayerEntity).client === player;
        // });
        player.entity.remove();
        this.emit('player leave', player);
        // this.broadcast({ cmd: 'player leave', player: player });
    }
    addPlayer(player) {
        this.players.push(player);
        player.room = this;
        let x, y;
        // if (player.profile) {
        //     x = player.profile.x;
        //     y = player.profile.y;
        // }
        // else {
        // }
        const p = this.map.getStartPos(this.players.length - 1);
        x = p.x;
        y = p.y;
        const player_entity = this.spawnEntity(PlayerEntity, x, y, player);
        player.entity = player_entity;
        // send all the existing entities
        this.entities.forEach(entity => {
            entity.send(player);
        });
        this.recentlyJoined.push([player, this.recentlyJoinedTimer]);
        this.emit('player join', player);
    }
    // move between rooms
    movePlayer(player, new_room) {
        this.removePlayer(player);
        new_room.addPlayer(player);
    }
    broadcast(packet) {
        this.players.forEach(player => {
            player.write(packet);
        });
    }
    close() {
        this.emit('close');
        this.broadcast({ cmd: 'room kick', message: 'Room is closing' });
        while (this.players.length > 0) {
            this.removePlayer(this.players[0]);
        }
    }
    serialize() {
        return {
            player_count: this.players.length,
            map: this.map,
            entities: this.entities.map(e => e.serialize())
        };
    }
}
export default Room;
