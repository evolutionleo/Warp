import Entity from '#concepts/entity';
import Client from '#concepts/client';
import Room from '#concepts/room';
import PhysicsEntity from './../physics_entity.js';

export default class PlayerEntity extends PhysicsEntity {
    isSolid = true;

    static type = 'Player';
    static object_name = 'oPlayer';
    // non-static
    type = PlayerEntity.type;
    object_name = PlayerEntity.object_name;

    preciseCollisions = true;

    base_size = {
        x: 32,
        y: 32
    }

    scale = {
        x: 2,
        y: 2
    }

    client:Client;

    constructor(room:Room, x:number = 0, y:number = 0, client:Client) {
        super(room, x, y);
        this.client = client;
    }

    create(x:number, y:number) {
        super.create(x, y);
    }

    update() {
        super.update();
    }
}