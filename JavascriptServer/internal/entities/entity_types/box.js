import PhysicsEntity from "#entities/physics_entity";

export default class Box extends PhysicsEntity {
    static type = 'Box';
    static object_name = 'oBox';
    // non-static
    type = Box.type;
    object_name = Box.object_name;
    
    stuck_action = 'stop';
    
    is_solid = true;
    
    base_size = {
        x: 32,
        y: 32
    };
    
    constructor(room, x, y) {
        super(room, x, y);
    }
}
