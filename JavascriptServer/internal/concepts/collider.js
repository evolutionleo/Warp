

// a wrapper around ICollider to get access to .entity
export class Collider {
    entity; // this is what all of this is for
    collider;
    
    get type() { return this.collider.type; }
    
    // get isStatic() { return this.collider.isStatic }
    // get isTrigger() { return this.collider.isTrigger }
    // set isStatic(_value) { this.collider.isStatic = _value }
    // set isTrigger(_value) { this.collider.isTrigger = _value }
    get isStatic() { return this.entity.isStatic; }
    get isTrigger() { return this.entity.isTrigger; }
    set isStatic(_value) { this.entity.isStatic = _value; }
    set isTrigger(_value) { this.entity.isTrigger = _value; }
    
    draw(context) { return this.collider.draw(context); }
    updateAABB() { return this.collider.updateAABB(); }
    
    get minX() { return this.collider.minX; }
    get maxX() { return this.collider.maxX; }
    get minY() { return this.collider.minY; }
    get maxY() { return this.collider.maxY; }
    
    
    // implement Polygon
    get pos() { return this.collider.pos; }
    get angle() { return this.collider.angle; }
    get offset() { return this.collider.offset; }
    get points() { return this.collider.points; }
    get edges() { return this.collider.edges; }
    get calcPoints() { return this.collider.calcPoints; }
    get normals() { return this.collider.normals; }
    
    set angle(_angle) { this.collider.angle = _angle; }
    set points(_points) { this.collider.points = _points; }
    set offset(_offset) { this.collider.offset = _offset; }
    
    rotate(_angle) { this.angle += _angle; return this; }
    translate(v) { }
    
    setAngle(_angle) { this.angle = _angle; return this; }
    setPoints(_points) { this.points = _points; return this; }
    setOffset(_offset) { this.offset = _offset; return this; }
    setPosition(_position) { this.setPosition(_position); return this; }
    
    getAABB() { return this.collider.getAABB(); }
    getCentroid() { return this.collider.getCentroid(); }
    
    // implement Circle
    get r() { return this.collider.r; }
    
    
    constructor(collider) {
        this.collider = collider;
    }
}

export default Collider;
