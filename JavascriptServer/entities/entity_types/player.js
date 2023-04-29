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
    
    collider_type = 'box';
    
    collision_type = 'discrete';
    precise_collisions = true;
    outside_room_action = 'wrap';
    
    stuck_action = 'stop';
    
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
    
    get name() { return this.client.name; }
    prop_names = ['name'];
    
    inputs = defaultInputs;
    
    
    is_solid = true;
    
    walksp;
    jump_speed;
    cut_jump;
    
    constructor(room, x = 0, y = 0, client) {
        super(room, x, y);
        this.client = client;
    }
    
    create() {
        super.create();
        this.walksp = 420;
        this.jump_speed = 600;
        this.cut_jump = false;
    }
    
    update(dt) {
        this.spd.x = this.inputs.move.x * this.walksp;
        
        if (this.inputs.keys.kjump && this.grounded()) {
            this.jump();
        }
        
        if (!this.inputs.keys.kjump && !this.cut_jump && !this.grounded() && this.spd.y <= -1) {
            this.spd.y /= 2;
            this.cut_jump = true;
        }
        
        super.update(dt);
        let p = this.client.profile;
        if (p) {
            p.state.x = this.x;
            p.state.y = this.y;
        }
    }
    
    jump() {
        this.spd.y = -this.jump_speed;
        this.cut_jump = false;
    }
}
