import Entity from '#concepts/entity'
import { ICollider, TBody } from 'detect-collisions'


// a wrapper around ICollider to get access to .entity
export class Collider implements ICollider {
    entity:Entity; // this is what all of this is for
    collider:TBody;

    get type() { return this.collider.type }

    // get isStatic() { return this.collider.isStatic }
    // get isTrigger() { return this.collider.isTrigger }
    // set isStatic(_value) { this.collider.isStatic = _value }
    // set isTrigger(_value) { this.collider.isTrigger = _value }
    get isStatic() { return this.entity.isStatic }
    get isTrigger() { return this.entity.isTrigger }
    set isStatic(_value) { this.entity.isStatic = _value }
    set isTrigger(_value) { this.entity.isTrigger = _value }

    draw(context) { return this.collider.draw(context) }
    updateAABB() { return this.collider.updateAABB() }

    get minX() { return this.collider.minX }
    get maxX() { return this.collider.maxX }
    get minY() { return this.collider.minY }
    get maxY() { return this.collider.maxY }


    // implement Polygon
    get pos() { return (this.collider as any).pos }
    get angle() { return (this.collider as any).angle }
    get offset() { return (this.collider as any).offset }
    get points() { return (this.collider as any).points }
    get edges() { return (this.collider as any).edges }
    get calcPoints() { return (this.collider as any).calcPoints }
    get normals() { return (this.collider as any).normals }

    set angle(_angle) { (this.collider as any).angle = _angle }
    set points(_points) { (this.collider as any).points = _points }
    set offset(_offset) { (this.collider as any).offset = _offset }

    rotate(_angle) { this.angle += _angle; return this; }
    translate(v) { }

    setAngle(_angle: number) { this.angle = _angle; return this; }
    setPoints(_points) { this.points = _points; return this; }
    setOffset(_offset) { this.offset = _offset; return this; }
    setPosition(_position) { this.setPosition(_position); return this; }

    getAABB() { return (this.collider as any).getAABB(); }
    getCentroid() { return (this.collider as any).getCentroid(); }
    
    // implement Circle
    get r() { return (this.collider as any).r }


    constructor(collider) {
        this.collider = collider;
    }
}

export default Collider;