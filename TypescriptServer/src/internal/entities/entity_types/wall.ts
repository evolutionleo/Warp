import Entity from "#concepts/entity";

export default class Wall extends Entity {
    is_solid = true;
    is_static = true;
    static type = "Wall";
    static object_name = "oWall";
    type = Wall.type;
    object_name = Wall.object_name;

    base_size = {
        x: 64,
        y: 64
    }
}