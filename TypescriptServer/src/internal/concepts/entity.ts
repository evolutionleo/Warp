import trace from '#util/logging';
import Point from "#types/point";
import BBox from '#types/bbox';
import { EventEmitter } from "events";
import { System, Circle, Polygon, ICollider, Types as ColliderTypes } from 'detect-collisions';
import * as SAT from 'sat';
import Collider from '#concepts/collider';

import { v4 as uuidv4, v4 } from 'uuid';
import Client from "./client";
import Room from "./room";


import PlayerEntity from "#entity/player";


export type ColliderType = 'polygon' | 'circle'


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
    isStatic = false;
    isTrigger = false;

    pos:Point;
    spd:Point;
    angle:number;

    prev_pos:Point;
    prev_serialized:string; // json of serialized entity

    base_size:Point = { x: 64, y: 64 };
    scale:Point = { x: 1, y: 1 };


    collider:Collider; // a polygon
    collider_type:ColliderType = 'polygon';
    collider_radius:number = this.width; // only relevant when collider_type is 'circle'
    collider_vertices:Point[] = []; // if this is not overridden, a default rectangle collider will be used

    get size():Point { // for collisions
        return {
            x: this.base_size.x * this.scale.x,
            y: this.base_size.y * this.scale.y
        }
    }

    prev_size:Point = this.size;

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

        // create the collider
        switch(this.collider_type) {
            case 'circle':
                this.collider = new Collider(
                    new Circle(this.pos, this.collider_radius)
                );
                break;
            case 'polygon':
                // the default 
                if (this.collider_vertices.length == 0) {
                    this.collider_vertices = [
                        {x: 0, y: this.height},
                        {x: this.width, y: this.height},
                        {x: this.width, y: 0},
                        {x: 0, y: 0}
                    ]
                }

                this.collider = new Collider(
                    new Polygon(this.pos, this.collider_vertices)
                );
                break;
            default:
                throw 'Unknown collider type: ' + this.collider_type;
        }

        this.collider.entity = this;
    }

    public create() {
        if (this.tags.includes('solid') || this.isSolid) {
            this.tree.insert(this.collider);
        }
    }

    // called from room.tick()
    public update() {
        this.emit('update');

        // if something changed - send again
        const serialized = JSON.stringify(this.serialize());
        if (serialized != this.prev_serialized || this.sendEveryTick) {
            this.prev_serialized = serialized;
            this.send();
        }
    }


    public matchesType(type?: EntityType|string):boolean {
        switch(typeof type) {
            case 'undefined': return true
            case 'string':
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
                break;
            case 'object':
                if (this instanceof (type as any)) {
                    return true;
                }
                break;
            default:
                console.error('Warning: Unknown type of `type`: ' + typeof type);
                return true;
        }
    }

    public regenerateCollider(x = this.x, y = this.y) {
        this.tree.remove(this.collider);
        
        this.collider = new Collider(
            new Polygon({x, y}, [
                {x: 0, y: this.height},
                {x: this.width, y: this.height},
                {x: this.width, y: 0},
                {x: 0, y: 0}
            ])
        );

        this.collider.entity = this;
        this.tree.insert(this.collider);
        // this.tree.updateBody(this.collider);
    }
    
    public placeMeeting(x:number = this.x, y:number = this.y, type?:EntityType|string):boolean {
        this.regenerateCollider(x, y);

        if (this.prev_size.x != this.size.x || this.prev_size.y != this.size.y) {
            trace('changed scale - regenerating the collider');
            this.regenerateCollider(x, y);
        }
        else {
            this.collider.pos.x = x;
            this.collider.pos.y = y;
            this.collider.setAngle(this.angle);
            this.collider.setPoints([
                {x: 0, y: this.height},
                {x: this.width, y: this.height},
                {x: this.width, y: 0},
                {x: 0, y: 0}
            ]);
            this.tree.updateBody(this.collider);
        }

        this.prev_size = {x: this.size.x, y: this.size.y}

        // the broad-phase
        let arr = this.tree.getPotentials(this.collider) as Collider[];
        // let arr = this.tree.all() as Collider[];

        if (this.type === 'Player') {
            // console.log(this.collider.collider);
            // console.log('all:', this.tree.all().length);
            // console.log('potentials: ' + arr.length);
            // console.log('colliding: ' + arr.filter(c => c !== this.collider && this.tree.checkCollision(this.collider, c)).length)
        }

        // the narrow-phase
        return arr.some(
            (c:Collider) => 
                c !== this.collider
                && c.entity.matchesType(type)
                && this.tree.checkCollision(this.collider, c)
        );
    }

    placeMeetingAll(x:number = this.x, y:number = this.y, type?:EntityType|string):Entity[] {
        // let bbox = this.getBBox(x, y);
        this.collider.pos.x = x;
        this.collider.pos.y = y;
        // this.collider

        let candidates = this.tree.getPotentials(this.collider) as Collider[];
        return candidates.filter(
            (c:Collider) =>
                c !== this.collider
                && c.entity.matchesType(type)
                && this.tree.checkCollision(this.collider, c)
        ).map(collider => collider.entity);
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
            this.tree.remove(this.collider);
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
    set width(_width) { this.base_size.x = _width / this.base_size.x }
    get height() { return this.size.y }
    set height(_height) { this.base_size.y = _height / this.base_size.y }

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