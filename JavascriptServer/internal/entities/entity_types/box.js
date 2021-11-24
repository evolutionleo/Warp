import PhysicsEntity from "#entities/physics_entity";
export default class Box extends PhysicsEntity {
    static type = 'Box';
    static object_name = 'oBox';

    constructor(room, x, y) {
        super(room, x, y);
        // non-static
        this.type = Box.type;
        this.object_name = Box.object_name;
        this.isSolid = true;
        this.base_size = {
            x: 32,
            y: 32
        };
    }
}