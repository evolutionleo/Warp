import PlayerEntity from '#entities/entity_types/player';
import { EventEmitter } from 'events';
// import Chunk from '#concepts/chunk';
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
}
export default class Room extends EventEmitter {
    constructor(map, lobby) {
        super();
        this.tickrate = tickrate;
        this.entities = new EntityList();
        this.players = [];
        this.lobby = lobby;
        // if provided a string -
        if (typeof map === 'string') {
            // find a map with the name
            this.map = global.maps.find(function (_map) {
                return _map.name === map;
            });
            if (this.map === undefined) {
                console.log(`Error: could not find a map called "${map}"`);
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
        this.unwrap(this.map.contents); //|| '[]');
        // this.unwrap(`[
        //     { "type": "Box", "x": 300, "y": 100 }
        // ]`);
    }
    // create entities from the contents string
    unwrap(contents = '[]') {
        if (typeof contents === 'string') {
            const entities = JSON.parse(contents);
            entities.forEach(entity => {
                const etype = global.entityNames[entity.type];
                // console.log(etype);
                this.spawnEntity(etype, entity.x, entity.y);
            });
        }
        else if (Array.isArray(contents)) {
            contents.forEach(entity => {
                const etype = global.entityNames[entity.type];
                // console.log(etype);
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
        // console.log('tick!');
        this.entities.forEach(entity => entity.update());
        this.emit('tick');
    }
    spawnEntity(etype, x, y, client) {
        if (client === null) {
            var entity = new etype(this, x, y);
        }
        else {
            var entity = new etype(this, x, y, client);
        }
        this.entities.push(entity);
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
    }
    addPlayer(player) {
        this.players.push(player);
        player.room = this;
        const player_entity = this.spawnEntity(PlayerEntity, player.profile.x, player.profile.y, player);
        player.entity = player_entity;
        // send all the existing entities, but only after the initial "Play" packet
        setTimeout(() => {
            this.entities.forEach(entity => {
                entity.send(player);
            });
        }, 10);
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
