import trace from '#util/logging';
import Point from "#types/point";
import BBox from '#types/bbox';
import { EventEmitter } from "events";

import { v4 as uuidv4, v4 } from 'uuid';
import Client from "./client";
import Room from "./room";

import PlayerEntity from "#entity/player";


export type EntityConstructor = {
    new (r: Room, x?:number, y?:number): Entity;
}

export type PlayerEntityConstructor = {
    new (r: Room, x?:number, y?:number, client?:Client): Entity;
}

export type SerializedEntity = {
    id?: string,
    type: string,
    object_name?: string,
    x: number,
    y: number,
    xscale: number,
    yscale: number,
    spd?: Point
}

export type EntityType = typeof Entity | typeof PlayerEntity;
export type EntityEvent = 'update' | 'death' | 'remove';


interface Entity {
    on(event:EntityEvent, callback:(...args:any[])=>void):this;
}

// a thing
class Entity extends EventEmitter {
    isSolid = false;

    pos:Point;
    spd:Point;

    prev_pos:Point;
    prev_serialized:string; // json of serialized entity

    base_size:Point = { x: 64, y: 64 };
    scale:Point = { x: 1, y: 1 };

    get size():Point { // for collisions
        return {
            x: this.base_size.x * this.scale.x,
            y: this.base_size.y * this.scale.y
        }
    }

    static type = 'Unknown';
    static object_name = 'oUnknownEntity';
    type = Entity.type; // non-static variable
    object_name = Entity.object_name;

    tags:string[] = [];
    sendEveryTick: boolean = false; // either send every frame or only on change

    room: Room;

    id: string;
    get uuid() { return this.id };
    set uuid(_uuid) { this.id = _uuid };
    

    constructor(room:Room, x:number = 0, y:number = 0) {
        super();
        this.id = uuidv4();
        this.room = room;
        // this.create(x, y); // moved to room.spawnEntity
        this.pos = { x, y };
        this.spd = { x: 0, y: 0};
    }

    create() {
        if (this.tags.includes('solid') || this.isSolid) {
            this.tree.insert(this);
        }
    }

    // called from room.tick()
    update() {
        this.emit('update');

        // if something changed - send again
        const serialized = JSON.stringify(this.serialize());
        if (serialized != this.prev_serialized || this.sendEveryTick) {
            this.prev_serialized = serialized;
            this.send();
        }
    }


    private matchesType(type: EntityType|string):boolean {
        if (typeof type === 'string') {
            if (this.type === type) {
                return true;
            }
            else if (this.object_name === type) {
                return true;
            }
            // else if (type === 'floor') {
            //     return this.isFloor;
            // }
            else if (type === 'solid') {
                return this.isSolid;
            }
            else if (this.hasTag(type)) {
                return true;
            }
        }
        else if (typeof type === 'object') {
            if (this instanceof (type as any)) {
                return true;
            }
        }
        else {
            console.error('Warning: Unknown type of `type`: ' + typeof type);
            return true;
        }
    }

    placeMeeting(x:number = this.x, y:number = this.y, type?:EntityType|string):boolean {
        let bbox = this.getBBox(x, y);

        if (type === undefined) {
            return this.tree.search(bbox).some(e => e !== this);
            // return this.tree.collides(bbox);
        }
        else {
            let candidates = this.tree.search(bbox);
            for(let entity of candidates) {
                if (entity !== this && entity.matchesType(type)) {
                    return true;
                }
            }
            return false;
        }
    }

    placeMeetingAll(x:number = this.x, y:number = this.y, type?:EntityType|string):Entity[] {
        let bbox = this.getBBox(x, y);

        let candidates = this.tree.search(bbox);
        return candidates.filter((entity) => entity.matchesType(type));
    }

    // entity death
    die() {
        this.emit('death');
        this.remove();
    }

    // removed from the room
    // mostly handled
    remove() {
        this.emit('remove');
        var pos = this.room.entities.indexOf(this);
        this.room.entities.splice(pos);
        if (this.isSolid) {
            this.tree.remove(this);
        }
    }

    serialize():SerializedEntity {
        return {
            id: this.id,
            type: this.type,
            object_name: this.object_name,
            x: this.x,
            y: this.y,
            xscale: this.xscale,
            yscale: this.yscale,
            spd: this.spd
        }
    }

    send(client?:Client) {
        const data = { cmd: 'entity', ...(this.serialize()) };
        if (client === undefined) {
            this.room.broadcast(data);
        }
        else {
            client.send(data);
        }
    }


    getBBox(x:number = this.x, y:number = this.y, w:number = this.width, h:number = this.height) {
        return {
            minX: x - w/2,
            minY: y - h/2,
            maxX: x + w/2 - 1, // because rbush is being weird about pixel-perfect stuff
            maxY: y + h/2,

            get left() { return this.minX },
            get right() { return this.maxX },
            get top() { return this.minY },
            get bottom() { return this.maxY }
        }
    }

    // tags idk
    hasTag(tag:string) {
        return this.tags.includes(tag);
    }

    addTag(tag:string) {
        return this.tags.push(tag);
    }

    // pos
    get x() { return this.pos.x }
    get y() { return this.pos.y }
    set x(_x) { this.pos.x = _x }
    set y(_y) { this.pos.y = _y }

    // scale
    get xscale() { return this.scale.x }
    get yscale() { return this.scale.y }
    set xscale(_xscale) { this.scale.x = _xscale }
    set yscale(_yscale) { this.scale.y = _yscale }

    // size
    get width() { return this.size.x }
    set width(_width) { this.size.x = _width }
    get height() { return this.size.y }
    set height(_height) { this.size.y = _height }

    // prev pos
    get xprev() { return this.prev_pos.x }
    get yprev() { return this.prev_pos.y }
    set xprev(x) { this.prev_pos.x = x }
    set yprev(y) { this.prev_pos.y = y }

    // bbox
    get bbox():BBox {
        return this.getBBox();
    }

    // other
    get tree() {
        return this.room.tree;
    }
}

export default Entity;