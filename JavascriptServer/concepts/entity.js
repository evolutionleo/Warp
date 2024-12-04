import { EventEmitter } from "events";
import { CircleCollider, BoxCollider, PolygonCollider } from '#concepts/collider';
import { isDeepStrictEqual } from 'util';



export function entityExists(entityType) {
    return global.entities.includes(entityType)
        || Object.keys(global.entity_objects).includes(entityType)
        || Object.keys(global.entity_names).includes(entityType);
}


// a thing
class Entity extends EventEmitter {
    static type = 'Unknown';
    static object_name = 'oUnknownEntity';
    type;
    object_name;
    
    is_solid = false;
    is_static = false;
    is_trigger = false;
    
    pos; // keep in mind that the coordinates are always set to a whole number (to achieve pixel-perfect collisions)
    spd; // speed in pixels per second, can be fractional
    angle = 0;
    origin = { x: 0, y: 0 }; // origin from 0 (top/left) to 1 (bottom/right)
    
    prev_pos;
    serialized; // save the last serialized version of this entity (to compare changes)
    
    base_size = { x: 64, y: 64 };
    scale = { x: 1, y: 1 };
    flip = { x: 0, y: 0 };
    
    
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
    collider_origin = { x: 0, y: 0 };
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
    
    _state = 0;
    states = {}; // e.x. "idle": 0, "walk": 1
    
    setState(value) {
        if (typeof value === 'string') {
            this._state = this.states[value];
        }
        // state is a number
        // (-1 means keep the old state)
        else if (value != -1) {
            this._state = value;
        }
    }
    
    set state(v) {
        this.setState(v);
    }
    
    get state() {
        return this._state;
    }
    
    
    constructor(room, x = 0, y = 0) {
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
    
    create() {
        this.regenerateCollider();
    }
    
    // called from room.tick()
    update(dt = 1) {
        this.emit('update');
        
        // if something changed - send again (add to the room's bundle)
        const new_serialized = this.serialize();
        if (this.sendEveryTick || !isDeepStrictEqual(new_serialized, this.serialized)) {
            this.serialized = new_serialized;
            this.send(true); // add to the bundle
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
        let pos = {
            x: x + this.width * (this.collider_origin.x - this.origin.x),
            y: y + this.height * (this.collider_origin.y - this.origin.y)
        };
        
        // create the collider
        switch (this.collider_type) {
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
    
    regenerateCollider(x = this.x, y = this.y) {
        if (this.collider !== null)
            this.tree.remove(this.collider);
        
        this.createCollider(x, y);
        
        this.tree.insert(this.collider);
    }
    
    updateCollider(x = this.x, y = this.y, collider = this.collider) {
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
    
    checkCollision(x = this.x, y = this.y, e, collider = this.collider) {
        this.updateCollider(x, y, collider);
        
        let result = this.tree.checkCollision(collider, e.collider);
        
        // move back the collider
        if (collider === this.collider)
            this.updateCollider(this.x, this.y);
        
        return result;
    }
    
    placeMeeting(x = this.x, y = this.y, type = 'solid', collider = this.collider) {
        this.updateCollider(x, y, collider);
        
        this.prev_size = { x: this.size.x, y: this.size.y };
        
        let result = this.tree.checkOne(this.collider, (res) => {
            let e = res.b.entity;
            return e && e.matchesType(type);
        });
        
        // move back the collider
        if (collider === this.collider)
            this.updateCollider(this.x, this.y);
        
        return result;
    }
    
    placeMeetingAll(x = this.x, y = this.y, type = 'solid', collider = this.collider) {
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
    
    isOutsideRoom(x = this.x, y = this.y) {
        let bbox = this.bbox; // don't call the getter every time
        
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
        let idx = this.room.entities.indexOf(this);
        if (idx === -1) { // already removed
            return;
        }
        this.emit('remove');
        this.room.entities.splice(idx, 1);
        this.tree.remove(this.collider);
    }
    
    serialize() {
        let struct = {
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
        };
        
        if (this.flip.x)
            struct.fx = true;
        if (this.flip.y)
            struct.fy = true;
        
        
        return struct;
    }
    
    bundle() {
        return this.serialize();
    }
    
    send(cached = false) {
        let data;
        
        if (!cached)
            data = this.bundle();
        else
            data = this.serialized;
        
        this.room.bundle.push(data);
    }
    
    
    getBBox() {
        let x = this.x, y = this.y;
        let w = this.width, h = this.height;
        
        let ox = this.origin.x;
        let oy = this.origin.y;
        
        return {
            left: x - w * ox,
            top: y - h * oy,
            right: x + w * (1 - ox),
            bottom: y + h * (1 - oy)
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
