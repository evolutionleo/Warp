import Entity from "#concepts/entity";
export default class Wall extends Entity {
    constructor() {
        super(...arguments);
        this.isSolid = true;
        this.type = Wall.type;
        this.object_name = Wall.object_name;
        this.base_size = {
            x: 64,
            y: 64
        };
    }
}
Wall.type = "Wall";
Wall.object_name = "oWall";
