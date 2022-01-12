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
    
    static type = 'Player';
    static object_name = 'oPlayer';
    // non-static
    type = PlayerEntity.type;
    object_name = PlayerEntity.object_name;
    
    collisionType = 'discrete';
    preciseCollisions = true;
    outsideRoomAction = 'wrap';
    
    stuckAction = 'stop';
    
    sendEveryTick = true;
    
    base_size = {
        x: 32,
        y: 32
    };
    
    scale = {
        x: 2,
        y: 2
    };
    
    client;
    
    inputs = defaultInputs;
    
    
    isSolid = true;
    
    walksp;
    jumpHeight;
    cutJump;
    
    constructor(room, x = 0, y = 0, client) {
        super(room, x, y);
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
