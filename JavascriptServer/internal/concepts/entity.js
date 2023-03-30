import { EventEmitter } from "events";
import { CircleCollider, BoxCollider, PolygonCollider } from '#concepts/collider';

import { v4 as uuidv4 } from 'uuid';

// a thing
class Entity extends EventEmitter {
    static type = 'Unknown';
    static object_name = 'oUnknownEntity';
    type;
    object_name;
    // type = Entity.type;
    // object_name = Entity.object_name;
    
    is_solid = false;
    is_static = false;
    is_trigger = false;
    
    pos; // keep in mind that the coordinates are always set to a whole number (to achieve pixel-perfect collisions)
    spd; // speed in pixels per second, can be fractional
    angle = 0;
    
    prev_pos;
    prev_serialized; // json of serialized entity
    
    base_size = { x: 64, y: 64 };
    scale = { x: 1, y: 1 };
    
    
    // the custom variables that need sending with the entitiy
    prop_names = []; // automatically loaded in load_room, but ideally should be manually set as well
    // e.x. prop_names = [ 'hp', 'mana', 'jumpHeight' ];
    
    get props() {
        let _props = {};
        this.prop_names.forEach(propName => _props[propName] = this[propName]);
        return _props;
    }
    
    
    collider = null; // a polygon or a circle
    collider_type = 'box';
    collider_radius = this.width / 2; // only relevant when collider_type is 'circle'
    collider_vertices = []; // if this is not overridden, a default rectangle collider will be used
    
    get size() {
        return {
            x: this.base_size.x * this.scale.x,
            y: this.base_size.y * this.scale.y
        };
    }
    
    prev_size = this.size;
    
    tags = [];
    sendEveryTick = false; // either send every frame or only on change
    
    room;
    
    id;
    get uuid() { return this.id; }
    ;
    set uuid(_uuid) { this.id = _uuid; }
    ;
    
    
    constructor(room, x = 0, y = 0) {
        super();
        this.id = uuidv4();
        this.room = room;
        this.pos = { x, y };
        this.spd = { x: 0, y: 0 };
        this.prev_pos = { x, y };
        
        this.type = this.constructor['type'];
        this.object_name = this.constructor['object_name'];
        
        this.createCollider();
        this.collider.entity = this;
        
        this.tree.insert(this.collider);
        
        // trace(this.prop_names)
    }
    
    create() {
        this.regenerateCollider();
    }
    
    // called from room.tick()
    update(dt = 1) {
        this.emit('update');
        
        // if something changed - send again (add to the room's bundle)
        const serialized = JSON.stringify(this.serialize());
        if (serialized != this.prev_serialized || this.sendEveryTick) {
            this.prev_serialized = serialized;
            this.send(); // add to the bundle
        }
    }
    
    
    matchesType(type) {
        switch (typeof type) {
            case 'undefined': return true;
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
                if (this instanceof type) {
                    return true;
                }
                break;
            default:
                console.error('Warning: Unknown type of `type`: ' + typeof type);
                return false;
        }
        
        return false;
    }
    
    createCollider(x = this.x, y = this.y) {
        let pos = { x: x, y: y };
        
        // create the collider
        switch (this.collider_type) {
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
    
    regenerateCollider(x = this.x, y = this.y) {
        if (this.collider !== null)
            this.tree.remove(this.collider);
        
        this.createCollider(x, y);
        
        this.tree.insert(this.collider);
    }
    
    updateCollider(x = this.x, y = this.y) {
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
    
    checkCollision(x = this.x, y = this.y, e) {
        this.updateCollider(x, y);
        return this.tree.checkCollision(this.collider, e.collider);
    }
    
    placeMeeting(x = this.x, y = this.y, type = 'solid') {
        this.updateCollider(x, y);
        
        this.prev_size = { x: this.size.x, y: this.size.y };
        
        return this.tree.checkOne(this.collider, (res) => {
            let e = res.b.entity;
            return e.matchesType(type);
        });
    }
    
    placeMeetingAll(x = this.x, y = this.y, type = 'solid') {
        this.updateCollider(x, y);
        
        let entities = [];
        this.tree.checkOne(this.collider, (res) => {
            let e = res.b.entity;
            if (e.matchesType(type))
                entities.push(e);
        });
        return entities;
    }
    
    isOutsideRoom(x = this.x, y = this.y) {
        let bbox = this.bbox; // this is an optimization btw
        
        return bbox.left - this.x + x > this.room.width
            || bbox.right - this.x + x < 0
            || bbox.bottom - this.y + y < 0
            || bbox.top - this.y + y > this.room.height;
    }
    
    stuck(x = this.x, y = this.y) {
        return this.placeMeeting(x, y);
    }
    
    roundPos() {
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
    
    roundedPos(n) {
        return Math.floor(Math.abs(n)) * Math.sign(n);
    }
    
    // entity death
    die() {
        this.emit('death');
        this.remove();
    }
    
    // removes the entity from the room (and triggers the 'remove' event)
    remove() {
        this.emit('remove');
        var pos = this.room.entities.indexOf(this);
        this.room.entities.splice(pos, 1);
        this.tree.remove(this.collider);
    }
    
    serialize() {
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
        };
    }
    
    bundle() {
        return this.serialize();
    }
    
    send() {
        const data = this.bundle();
        this.room.bundle.push(data);
    }
    
    
    getBBox() {
        let x = this.x, y = this.y;
        let w = this.width, h = this.height;
        
        return {
            // left: x - w/2,
            // top: y - h/2,
            // right: x + w/2,
            // bottom: y + h/2,
            
            left: x,
            top: y,
            right: x + w,
            bottom: y + h
        };
    }
    
    // tags idk
    hasTag(tag) {
        return this.tags.includes(tag);
    }
    
    addTag(tag) {
        if (tag == 'solid')
            this.is_solid = true;
        
        return this.tags.push(tag);
    }
    
    // pos
    get x() { return this.pos.x; }
    get y() { return this.pos.y; }
    set x(_x) { this.pos.x = _x; }
    set y(_y) { this.pos.y = _y; }
    
    // scale
    get xscale() { return this.scale.x; }
    get yscale() { return this.scale.y; }
    set xscale(_xscale) { this.scale.x = _xscale; }
    set yscale(_yscale) { this.scale.y = _yscale; }
    
    // size
    get width() { return this.size.x; }
    set width(_width) { this.base_size.x = _width / this.base_size.x; }
    get height() { return this.size.y; }
    set height(_height) { this.base_size.y = _height / this.base_size.y; }
    
    // prev pos
    get xprev() { return this.prev_pos.x; }
    get yprev() { return this.prev_pos.y; }
    set xprev(x) { this.prev_pos.x = x; }
    set yprev(y) { this.prev_pos.y = y; }
    
    // bbox
    get bbox() {
        return this.getBBox();
    }
    
    // other
    get tree() {
        return this.room.tree;
    }
}

export default Entity;
