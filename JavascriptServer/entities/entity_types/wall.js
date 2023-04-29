import Entity from "#concepts/entity";

export default class Wall extends Entity {
    static type = 'Wall';
    static object_name = 'oWall';
    
    is_solid = true;
    is_static = true;
    
    base_size = {
        x: 64,
        y: 64
    };
}
