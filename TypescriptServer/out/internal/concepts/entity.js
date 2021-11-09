import { EventEmitter } from "events";
import { v4 as uuidv4 } from 'uuid';
// a thing
class Entity extends EventEmitter {
    constructor(room, x = 0, y = 0) {
        super();
        this.base_size = { x: 64, y: 64 };
        this.type = Entity.type; // non-static variable
        this.object_name = Entity.object_name;
        this.isSolid = false;
        this.id = uuidv4();
        this.room = room;
        this.create(x, y);
        if (this.isSolid) {
            console.log('inserting a ' + this.type);
            this.tree.insert(this);
        }
    }
    get size() {
        return {
            x: this.base_size.x * this.scale.x,
            y: this.base_size.y * this.scale.y
        };
    }
    get uuid() { return this.id; }
    ;
    set uuid(_uuid) { this.id = _uuid; }
    ;
    create(x, y) {
        this.pos = { x, y };
        this.scale = { x: 1, y: 1 };
        this.spd = { x: 0, y: 0 };
    }
    // called from room.tick()
    update() {
        this.emit('update');
        // if something changed - send again
        const serialized = JSON.stringify(this.serialize());
        if (serialized != this.prev_serialized) {
            this.prev_serialized = serialized;
            this.send();
        }
    }
    placeMeeting(x = this.x, y = this.y, type) {
        let bbox = this.getBBox(x, y);
        if (type === undefined) {
            return this.tree.collides(bbox);
        }
        else {
            let candidates = this.tree.search(bbox);
            for (let entity of candidates) {
                if (entity.type === type) {
                    return true;
                }
                else if (entity instanceof type) {
                    return true;
                }
            }
            return false;
        }
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
    serialize() {
        return {
            id: this.id,
            type: this.type,
            object_name: this.object_name,
            x: this.x,
            y: this.y,
            xscale: this.xscale,
            yscale: this.yscale,
            spd: this.spd
        };
    }
    send(client) {
        const data = { cmd: 'entity', ...(this.serialize()) };
        if (client === undefined) {
            this.room.broadcast(data);
        }
        else {
            client.send(data);
        }
    }
    getBBox(x = this.x, y = this.y, w = this.width, h = this.height) {
        return {
            minX: x - w / 2,
            minY: y - h / 2,
            maxX: x + w / 2,
            maxY: y + h / 2,
            get left() { return this.minX; },
            get right() { return this.maxX; },
            get top() { return this.minY; },
            get bottom() { return this.maxY; }
        };
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
    set width(_width) { this.size.x = _width; }
    get height() { return this.size.y; }
    set height(_height) { this.size.y = _height; }
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
Entity.type = 'Unknown';
Entity.object_name = 'oUnknownEntity';
export default Entity;
