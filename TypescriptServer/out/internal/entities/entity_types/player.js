import PhysicsEntity from './../physics_entity.js';
export default class PlayerEntity extends PhysicsEntity {
    constructor(room, x = 0, y = 0, client) {
        super(room, x, y);
        this.isSolid = true;
        // non-static
        this.type = PlayerEntity.type;
        this.object_name = PlayerEntity.object_name;
        this.preciseCollisions = true;
        this.base_size = {
            x: 32,
            y: 32
        };
        this.scale = {
            x: 2,
            y: 2
        };
        this.client = client;
    }
    create(x, y) {
        super.create(x, y);
    }
    update() {
        super.update();
    }
}
PlayerEntity.type = 'Player';
PlayerEntity.object_name = 'oPlayer';
