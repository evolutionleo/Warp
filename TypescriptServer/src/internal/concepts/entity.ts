import trace from '#util/logging';
import Point from "#types/point";
import BBox from '#types/bbox';
import { EventEmitter } from "events";
import { System, Circle, Polygon, Body, BodyType as ColliderTypes } from 'detect-collisions';
import sat from 'sat';
import { CircleCollider, BoxCollider, PolygonCollider, Collider } from '#concepts/collider';

import { v4 as uuidv4 } from 'uuid';
import Client from "#concepts/client";
import Room from "#concepts/room";

const { Vector } = sat;

import PlayerEntity from "#entity/player";


export type ColliderType = 'polygon' | 'circle' | 'box';


export type EntityConstructor = {
    new (r: Room, x?:number, y?:number): Entity;
}

export type PlayerEntityConstructor = {
    new (r: Room, x?:number, y?:number, client?:Client): Entity;
}

export type SerializedEntity = {
    id?: string,
    type: string,
    obj?: string,
    x: number,
    y: number,
    xscale: number,
    yscale: number,
    spd?: Point,
    props?: { // custom variables
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
    isSolid = false;
    isStatic = false;
    isTrigger = false;

    pos:Point; // keep in mind that the coordinates are always set to a whole number (to achieve pixel-perfect collisions)
    spd:Point; // speed in pixels per second, can be fractional
    angle:number = 0;

    prev_pos:Point;
    prev_serialized:string; // json of serialized entity

    base_size:Point = { x: 64, y: 64 };
    scale:Point = { x: 1, y: 1 };


    // the custom variables that need sending with the entitiy
    propNames:string[] = []; // automatically loaded in load_room, but ideally should be manually set as well
    // e.x. propNames = [ 'hp', 'mana', 'jumpHeight' ];

    get props() {
        let _props = {};
        this.propNames.forEach(propName => _props[propName] = this[propName]);
        return _props;
    }


    collider:Collider = null; // a polygon or a circle
    collider_type:ColliderType|string = 'box';
    collider_radius:number = this.width/2; // only relevant when collider_type is 'circle'
    collider_vertices:Point[] = []; // if this is not overridden, a default rectangle collider will be used
    private polygon_set:boolean = false;

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
        this.prev_pos = { x, y };

        this.createCollider();
        this.collider.entity = this;

        this.tree.insert(this.collider);

        // trace(this.propNames)
    }

    public create() {
        this.regenerateCollider();
    }

    // called from room.tick()
    public update(dt:number = 1) {

        this.emit('update');

        // this.roundPos();

        // if something changed - send again (add to the room's bundle)
        const serialized = JSON.stringify(this.serialize());
        if (serialized != this.prev_serialized || this.sendEveryTick) {
            this.prev_serialized = serialized;
            this.send(); // add to the bundle
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
        
        // if (this.size.x != this.prev_size.x || this.size.y != this.prev_size.y) {
        //     // change the collider scale by the same ratio as the entity scale
        //     this.collider.setScale(this.collider.scaleX * this.size.x / this.prev_size.x, this.collider.scaleY * this.size.y / this.prev_size.y);
        // }
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
            // trace('a:', res.a.entity.type);
            // trace('b:', e.type);
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

        // round
        // this.frac_pos.x = this.pos.x - this.roundedPos(this.pos.x);
        // this.frac_pos.y = this.pos.y - this.roundedPos(this.pos.y);

        this.pos.x = this.roundedPos(this.pos.x);
        this.pos.y = this.roundedPos(this.pos.y);

        // if we became stuck - go back
        if (this.stuck()) {
            this.pos.x = prev_x;
            this.pos.y = prev_y;
        }
    }

    // public unroundPos() {
    //     this.pos.x += this.frac_pos.x;
    //     this.pos.y += this.frac_pos.y;
    // }

    public roundedPos(n:number) {
        // return Math.floor(n);
        // return Math.floor(Math.abs(n) * 100) * Math.sign(n) / 100;
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
        // if (this.isSolid) {
            this.tree.remove(this.collider);
        // }
    }

    public serialize():SerializedEntity {
        return {
            id: this.id,
            type: this.type,
            obj: this.object_name,
            x: this.roundedPos(this.x),
            y: this.roundedPos(this.y),
            xscale: this.xscale,
            yscale: this.yscale,
            spd: this.spd,
            props: this.props // uses a getter for props
        }
    }

    public bundle() {
        return this.serialize();
    }

    public send() {
        const data = this.bundle();
        this.room.bundle.push(data);
    }


    public getBBox() {
        let x:number = this.x, y:number = this.y;
        let w:number = this.width, h:number = this.height;

        return {
            // left: x - w/2,
            // top: y - h/2,
            // right: x + w/2,
            // bottom: y + h/2,
            
            left: x,
            top: y,
            right: x + w,
            bottom: y + h,

            // get left() { return this.minX },
            // get right() { return this.maxX },
            // get top() { return this.minY },
            // get bottom() { return this.maxY }
        }
    }

    // tags idk
    public hasTag(tag:string) {
        return this.tags.includes(tag);
    }

    public addTag(tag:string) {
        if (tag == 'solid')
            this.isSolid = true;
        
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