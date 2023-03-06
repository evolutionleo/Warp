import trace from '#util/logging';
import Entity from '#concepts/entity';
import Client from '#concepts/client';
import Room from '#concepts/room';
import Point from '#types/point';
import PhysicsEntity, { OutsideRoomAction, CollisionType, StuckAction } from './../physics_entity.js';

export interface IPlayerInputs {
    keys: {
        kright: number,
        kleft: number,
        kup: number,
        kdown: number,
        kjump: boolean,
        kjump_rel: boolean,
        kjump_press: boolean
    }
    move: Point;
}

export const defaultInputs:IPlayerInputs = {
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

    collider_type = 'box';

    collision_type = 'discrete' as CollisionType;
    precise_collisions = true;
    outside_room_action:OutsideRoomAction = 'wrap';

    stuck_action:StuckAction = 'stop';

    sendEveryTick = true;

    base_size = {
        x: 32,
        y: 32
    }

    scale = {
        x: 2,
        y: 2
    }

    client:Client;
    
    get name() { return this.client.name; }
    prop_names = ['name'];

    inputs:IPlayerInputs = defaultInputs;


    is_solid:boolean = true;

    walksp:number;
    jump_speed:number;
    cut_jump:boolean;

    constructor(room:Room, x:number = 0, y:number = 0, client:Client) {
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