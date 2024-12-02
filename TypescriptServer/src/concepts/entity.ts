import trace from '#util/logging';
import Point from "#types/point";
import BBox from '#types/bbox';
import { EventEmitter } from "events";
import { CircleCollider, BoxCollider, PolygonCollider, Collider } from '#concepts/collider';

import Client from "#concepts/client";
import Room from "#concepts/room";

import PlayerEntity from "#entities/player";
import { isDeepStrictEqual } from 'util';



export function entityExists(entityType: typeof Entity|string): boolean {
    return global.entities.includes(entityType as typeof Entity)
        || Object.keys(global.entity_objects).includes(entityType as string)
        || Object.keys(global.entity_names).includes(entityType as string);
}


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
    fx?: boolean, // flip
    fy?: boolean,

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

    is_solid = false;
    is_static = false;
    is_trigger = false;

    pos:Point; // keep in mind that the coordinates are always set to a whole number (to achieve pixel-perfect collisions)
    spd:Point; // speed in pixels per second, can be fractional
    angle:number = 0;
    origin:Point = {x: 0, y: 0}; // origin from 0 (top/left) to 1 (bottom/right)

    prev_pos:Point;
    serialized:SerializedEntity; // save the last serialized version of this entity (to compare changes)

    base_size:Point = { x: 64, y: 64 };
    scale:Point = { x: 1, y: 1 };
    flip:Point = { x: 0, y: 0 };


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
    collider_origin:Point = {x: 0, y: 0};
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
        // state is a number
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
        this.id = crypto.randomUUID();
        this.room = room;
        this.pos = { x, y };
        this.spd = { x: 0, y: 0 };
        this.prev_pos = { x, y };

        this.type = this.constructor['type'];
        this.object_name = this.constructor['object_name'];

        this.createCollider();

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
        let pos = {
            x: x + this.width * (this.collider_origin.x - this.origin.x),
            y: y + this.height * (this.collider_origin.y - this.origin.y)
        };

        // create the collider
        switch(this.collider_type) {
            case 'box':
                this.collider = new BoxCollider(pos, this.base_size.x - .01, this.base_size.y - .01);
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

        this.collider.setScale(this.xscale, this.yscale);
        this.collider.setAngle(this.angle);
        // this.tree.updateBody(this.collider);

        this.collider.entity = this;
    }

    public regenerateCollider(x = this.x, y = this.y) {
        if (this.collider !== null)
            this.tree.remove(this.collider);
        
        this.createCollider(x, y);
        
        this.tree.insert(this.collider);
    }
    
    protected updateCollider(x = this.x, y = this.y, collider = this.collider) {
        let pos = {
            x: x + this.width * (this.collider_origin.x - this.origin.x),
            y: y + this.height * (this.collider_origin.y - this.origin.y)
        };

        if (collider === this.collider) {
            collider.setScale(this.xscale, this.yscale);
            collider.setAngle(this.angle);
            collider.setPosition(pos.x, pos.y);
        }
        else {
            collider.setPosition(x, y);
        }
        
        this.tree.updateBody(collider);
    }

    public checkCollision(x: number = this.x, y: number = this.y, e:Entity, collider = this.collider):boolean {
        this.updateCollider(x, y, collider);
        
        let result = this.tree.checkCollision(collider, e.collider);

        // move back the collider
        if (collider === this.collider)
            this.updateCollider(this.x, this.y);

        return result;
    }

    public placeMeeting(x:number = this.x, y:number = this.y, type:EntityType|string = 'solid', collider = this.collider):boolean {
        this.updateCollider(x, y, collider);

        this.prev_size = {x: this.size.x, y: this.size.y}

        let result = this.tree.checkOne(this.collider, (res) => {
            let e = res.b.entity;
            return e && e.matchesType(type);
        });

        // move back the collider
        if (collider === this.collider)
            this.updateCollider(this.x, this.y);

        return result;
    }

    public placeMeetingAll<T = Entity>(x:number = this.x, y:number = this.y, type:EntityType|string = 'solid', collider = this.collider):T[] {
        this.updateCollider(x, y, collider);

        let entities = [];
        this.tree.checkOne(collider, (res) => {
            let e = res.b.entity;
            if (e && e.matchesType(type))
                entities.push(e);
        });

        // move back the collider
        if (collider === this.collider)
            this.updateCollider(this.x, this.y);

        return entities;
    }

    isOutsideRoom(x = this.x, y = this.y):boolean {
        let bbox = this.bbox; // don't call the getter every time

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
        let idx = this.room.entities.indexOf(this);
        if (idx === -1) { // already removed
            return;
        }
        this.emit('remove');
        this.room.entities.splice(idx, 1);
        this.tree.remove(this.collider);
    }

    public serialize():SerializedEntity {
        let struct:SerializedEntity = {
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

        if (this.flip.x)
            struct.fx = true;
        if (this.flip.y)
            struct.fy = true;


        return struct;
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

        let ox = this.origin.x;
        let oy = this.origin.y;

        return {
            left: x - w*ox,
            top: y - h*oy,
            right: x + w*(1-ox),
            bottom: y + h*(1-oy)
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