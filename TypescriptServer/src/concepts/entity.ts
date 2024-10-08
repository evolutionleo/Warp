import trace from '#util/logging';
import Point from "#types/point";
import BBox from '#types/bbox';
import { EventEmitter } from "events";
import { CircleCollider, BoxCollider, PolygonCollider, Collider } from '#concepts/collider';

import { v4 as uuidv4 } from 'uuid';
import Client from "#concepts/client";
import Room from "#concepts/room";

import PlayerEntity from "#entities/player";
import { isDeepStrictEqual } from 'util';


export type ColliderType = 'polygon' | 'circle' | 'box';


export type EntityConstructor = {
    new (r: Room, x?:number, y?:number): Entity;
}

export type PlayerEntityConstructor = {
    new (r: Room, x?:number, y?:number, client?:Client): Entity;
}

export type SerializedEntity = {
    id?: string,
    t: string,
    obj?: string,
    x: number,
    y: number,
    xs: number,
    ys: number,
    a: number,
    spd?: Point,
    st: number, // state

    p?: { // custom variables
        [name: string]: any
    }
}

export type EntityType = typeof Entity | typeof PlayerEntity;
export type EntityEvent = 'update' | 'death' | 'remove';


interface Entity {
    on(event:EntityEvent, callback:(...args:any[])=>void):this;
}

// a thing
class Entity extends EventEmitter {
    static type:string = 'Unknown';
    static object_name:string = 'oUnknownEntity';
    type: string;
    object_name: string;
    // type = Entity.type;
    // object_name = Entity.object_name;

    is_solid = false;
    is_static = false;
    is_trigger = false;

    pos:Point; // keep in mind that the coordinates are always set to a whole number (to achieve pixel-perfect collisions)
    spd:Point; // speed in pixels per second, can be fractional
    angle:number = 0;

    prev_pos:Point;
    serialized:SerializedEntity; // save the last serialized version of this entity (to compare changes)

    base_size:Point = { x: 64, y: 64 };
    scale:Point = { x: 1, y: 1 };


    // the custom variables that need sending with the entitiy
    prop_names:string[] = []; // automatically loaded in load_room, but ideally should be manually set as well
    // e.x. prop_names = [ 'hp', 'mana', 'jumpHeight' ];

    get props() {
        let _props = {};
        this.prop_names.forEach(propName => _props[propName] = this[propName]);
        return _props;
    }


    collider:Collider = null; // a polygon or a circle
    collider_type:ColliderType|string = 'box';
    collider_radius:number = this.width/2; // only relevant when collider_type is 'circle'
    collider_vertices:Point[] = []; // if this is not overridden, a default rectangle collider will be used

    get size():Point { // for collisions
        return {
            x: this.base_size.x * this.scale.x,
            y: this.base_size.y * this.scale.y
        }
    }

    prev_size:Point = this.size;

    tags:string[] = [];
    sendEveryTick: boolean = false; // either send every frame or only on change

    room: Room;

    id: string;
    get uuid() { return this.id };
    set uuid(_uuid) { this.id = _uuid };

    _state = 0;
    states = {}; // e.x. "idle": 0, "walk": 1
    
    setState(value:number|string) {
        if (typeof value === 'string') {
            this._state = this.states[value];
        }
        // it's a number
        // (-1 means keep the old state)
        else if (value != -1) {
            this._state = value;
        }
    }

    set state(v:number|string) {
        this.setState(v);
    }

    get state():number {
        return this._state;
    }
    

    constructor(room:Room, x:number = 0, y:number = 0) {
        super();
        this.id = uuidv4();
        this.room = room;
        this.pos = { x, y };
        this.spd = { x: 0, y: 0};
        this.prev_pos = { x, y };

        this.type = this.constructor['type'];
        this.object_name = this.constructor['object_name'];

        this.createCollider();
        this.collider.entity = this;

        this.tree.insert(this.collider);
    }

    public create() {
        this.regenerateCollider();
    }

    // called from room.tick()
    public update(dt:number = 1) {
        this.emit('update');

        // if something changed - send again (add to the room's bundle)
        const new_serialized = this.serialize();
        if (this.sendEveryTick || !isDeepStrictEqual(new_serialized, this.serialized)) {
            this.serialized = new_serialized;
            this.send(true); // add to the bundle
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
                else if (type === 'solid') {
                    return this.is_solid;
                }
                else if (this.hasTag(type)) {
                    return true;
                }
                break;
            case 'object':
            case 'function':
                if (this instanceof (type as any)) {
                    return true;
                }
                break;
            default:
                console.error('Warning: Unknown type of `type`: ' + typeof type);
                return false;
        }

        return false;
    }

    public createCollider(x = this.x, y = this.y) {
        let pos = {x: x, y: y};

        // create the collider
        switch(this.collider_type) {
            case 'box':
                this.collider = new BoxCollider(pos, this.width - .01, this.height - .01);
                break;
            case 'circle':
                this.collider = new CircleCollider(pos, this.collider_radius);
                break;
            case 'polygon':
                this.collider = new PolygonCollider(pos, this.collider_vertices);
                break;
            default:
                this.collider = null;
                throw 'Unknown collider type: ' + this.collider_type;
        }

        this.collider.entity = this;
    }

    public regenerateCollider(x = this.x, y = this.y) {
        if (this.collider !== null)
            this.tree.remove(this.collider);
        
        this.createCollider(x, y);
        
        this.tree.insert(this.collider);
    }
    
    protected updateCollider(x = this.x, y = this.y) {
        if (this.size.x != this.prev_size.x || this.size.y != this.prev_size.y) {
            this.regenerateCollider(x, y);
        }
        
        this.collider.setAngle(this.angle);
        this.collider.setPosition(x, y);
        this.tree.updateBody(this.collider);
    }

    public checkCollision(x: number = this.x, y: number = this.y, e:Entity):boolean {
        this.updateCollider(x, y);
        return this.tree.checkCollision(this.collider, e.collider);
    }

    public placeMeeting(x:number = this.x, y:number = this.y, type:EntityType|string = 'solid'):boolean {
        this.updateCollider(x, y);

        this.prev_size = {x: this.size.x, y: this.size.y}

        return this.tree.checkOne(this.collider, (res) => {
            let e = res.b.entity;
            return e.matchesType(type);
        });
    }

    public placeMeetingAll<T = Entity>(x:number = this.x, y:number = this.y, type:EntityType|string = 'solid'):T[] {
        this.updateCollider(x, y);

        let entities = [];
        this.tree.checkOne(this.collider, (res) => {
            let e = res.b.entity;
            if (e.matchesType(type))
                entities.push(e);
        });
        return entities;
    }

    isOutsideRoom(x = this.x, y = this.y):boolean {
        let bbox = this.bbox; // this is an optimization btw

        return bbox.left - this.x + x > this.room.width
            || bbox.right - this.x + x < 0
            || bbox.bottom - this.y + y < 0
            || bbox.top - this.y + y > this.room.height;
    }

    stuck(x = this.x, y = this.y) {
        return this.placeMeeting(x, y);
    }

    public roundPos() { // round to 100ths
        let prev_x = this.pos.x;
        let prev_y = this.pos.y;

        this.pos.x = this.roundedPos(this.pos.x);
        this.pos.y = this.roundedPos(this.pos.y);

        // if we became stuck - go back
        if (this.stuck()) {
            this.pos.x = prev_x;
            this.pos.y = prev_y;
        }
    }

    public roundedPos(n:number) {
        return Math.floor(Math.abs(n)) * Math.sign(n);
    }

    // entity death
    public die() {
        this.emit('death');
        this.remove();
    }

    // removes the entity from the room (and triggers the 'remove' event)
    public remove() {
        this.emit('remove');
        var pos = this.room.entities.indexOf(this);
        this.room.entities.splice(pos, 1);
        this.tree.remove(this.collider);
    }

    public serialize():SerializedEntity {
        return {
            id: this.id,
            t: this.type,
            obj: this.object_name,
            x: this.roundedPos(this.x),
            y: this.roundedPos(this.y),
            xs: this.xscale,
            ys: this.yscale,
            a: this.angle,
            spd: this.spd,
            p: this.props, // uses a getter for props
            st: this.state
        }
    }

    public bundle() {
        return this.serialize();
    }

    public send(cached = false) {
        let data: SerializedEntity;

        if (!cached)
            data = this.bundle();
        else
            data = this.serialized;

        this.room.bundle.push(data);
    }


    public getBBox() {
        let x:number = this.x, y:number = this.y;
        let w:number = this.width, h:number = this.height;

        return {
            left: x,
            top: y,
            right: x + w,
            bottom: y + h
        }
    }

    // tags idk
    public hasTag(tag:string) {
        return this.tags.includes(tag);
    }

    public addTag(tag:string) {
        if (tag == 'solid')
            this.is_solid = true;
        
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