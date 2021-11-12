import PhysicsEntity from './../physics_entity.js';
export const defaultInputs = {
    move: {
        x: 0,
        y: 0
    },
    keys: {
        kright: 0,
        kleft: 0,
        kup: 0,
        kdown: 0,
        kjump: false,
        kjump_rel: false,
        kjump_press: false
    }
};
export default class PlayerEntity extends PhysicsEntity {
    constructor(room, x = 0, y = 0, client) {
        super(room, x, y);
        // non-static
        this.type = PlayerEntity.type;
        this.object_name = PlayerEntity.object_name;
        this.preciseCollisions = true;
        this.outsideRoomAction = 'wrap';
        this.base_size = {
            x: 32,
            y: 32
        };
        this.scale = {
            x: 2,
            y: 2
        };
        this.inputs = defaultInputs;
        this.isSolid = true;
        this.client = client;
    }
    create() {
        super.create();
        this.walksp = 7;
        this.jumpHeight = 12.5;
        this.cutJump = false;
    }
    update() {
        this.spd.x = this.inputs.move.x * this.walksp;
        if (this.inputs.keys.kjump && this.grounded()) {
            this.jump();
        }
        if (!this.inputs.keys.kjump && !this.cutJump && !this.grounded() && this.spd.y <= -1) {
            this.spd.y /= 2;
            this.cutJump = true;
        }
        super.update();
        let p = this.client.profile;
        if (p) {
            p.x = this.x;
            p.y = this.y;
        }
    }
    jump() {
        this.spd.y = -this.jumpHeight;
        this.cutJump = false;
    }
}
PlayerEntity.type = 'Player';
PlayerEntity.object_name = 'oPlayer';
