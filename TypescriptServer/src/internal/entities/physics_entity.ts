import Point from '#types/point';
import Entity from '#concepts/entity';
import Room from '#concepts/room';

import { clamp, approach } from '#util/maths';
import trace from '#util/logging';

// 'ignore' means the entity would just go outside bounds
export type OutsideRoomAction = 'wrap' | 'stop' | 'ignore';
export type CollisionType = 'discrete' | 'continuous';
export type StuckAction = 'stop' | 'clip';

export default class PhysicsEntity extends Entity {
    physicsEnabled:boolean = true;

    grv:Point = { x: 0, y: 800 };
    max_spd:Point = {x: 2000, y: 2000};

    outsideRoomAction: OutsideRoomAction = 'stop';
    collisionType:CollisionType = 'discrete'; // discrete or continuout
    collisionPrecision:number = 5; // only works with collisionType != 'discrete'

    preciseCollisions = true; // pixel-perfect, but is slower

    stuckAction:StuckAction = 'stop'; // or 'clip' to clip through walls

    constructor(room:Room, x: number = 0, y: number = 0) {
        super(room, x, y);
    }

    move(xspd:number = undefined, yspd:number = 0, dt: number = this.room.dt):void {
        // default move
        let def_move = xspd == undefined;
        if (def_move) {
            xspd = this.spd.x;
            yspd = this.spd.y;
        }

        xspd *= dt;
        yspd *= dt;


        // stuck in a solid object
        if (this.stuck()) {
            // just clip through everything?
            if (this.stuckAction === 'clip') {
                this.x += xspd;
                this.y += yspd;
            }
            return; // help me im stuck
        }


        if (this.isCollidingX(this.x, this.y, xspd)) {
            if (this.preciseCollisions && xspd != 0) {
                while(!this.isCollidingX(this.x, this.y, Math.sign(xspd))) {
                    this.x += Math.sign(xspd);
                }
            }
            if (def_move)
                this.spd.x = 0;
            xspd = 0;
        }
        if (this.outsideRoomAction === 'stop' && this.isOutsideRoom(this.x + xspd, this.y)) {
            if (def_move)
                this.spd.x = 0
            xspd = 0;
        }
        this.x += xspd;
        this.updateCollider();

        if (this.isCollidingY(this.x, this.y, yspd)) {
            if (this.preciseCollisions && yspd != 0) {
                while(!this.isCollidingY(this.x, this.y, Math.sign(yspd))) {
                    this.y += Math.sign(yspd);
                }
            }
            if (def_move)
                this.spd.y = 0;
            yspd = 0;
        }
        if (this.outsideRoomAction === 'stop' && this.isOutsideRoom(this.x, this.y + yspd)) {
            if (def_move) {
                this.spd.y = 0;
            }
            yspd = 0;
        }
        this.y += yspd;
        this.updateCollider();
    }

    update(dt:number = 1) {
        this.spd.x += this.grv.x * dt;
        this.spd.y += this.grv.y * dt;

        this.spd.x = clamp(this.spd.x, -this.max_spd.x, this.max_spd.x);
        this.spd.y = clamp(this.spd.y, -this.max_spd.y, this.max_spd.y);

        this.move();
        this.wrapOutsideRoom();

        super.update(dt);
    }


    grounded(x = this.x, y = this.y, type = undefined):boolean {
        return this.placeMeeting(x, y+1, type);
    }



    private wrapOutsideRoom() {
        if (this.outsideRoomAction !== 'wrap' || !this.isOutsideRoom())
            return false;

        let tryWrap = (x:number, y:number) => {
            if (!this.placeMeeting(x, y)) {
                this.x = x;
                this.y = y;
            }
        }
        
        let bbox = this.bbox; // this is an optimization btw

        // if outside the right bound and moving right
        if (bbox.left > this.room.width + 1 && Math.sign(this.spd.x) == 1) {
            tryWrap(this.x - bbox.right + 0, this.y);
        } // if outside the left bound and moving left
        else if (bbox.right < 0 - 1 && Math.sign(this.spd.x) == -1) {
            tryWrap(bbox.left - this.x + this.room.width, this.y);
        }

        // etc. etc.
        if (bbox.bottom < 0 && Math.sign(this.spd.y) == -1) {
            tryWrap(this.x, bbox.bottom - this.y + this.room.height);
        }
        else if (bbox.top > this.room.height && Math.sign(this.spd.y) == 1) {
            tryWrap(this.x, this.y - bbox.bottom + 0);
        }
    }

    isCollidingX(x = this.x, y = this.y, xspd = this.spd.x) {
        if (this.collisionType === 'discrete') {
            return this.placeMeeting(x + xspd, y);
        }
        else { // continuous
            let target_x = x + xspd;
            let curr_x = x;

            let step = Math.max( Math.abs( target_x - curr_x ) / this.collisionPrecision, 1) * Math.sign( target_x - curr_x );

            while(curr_x != target_x) {
                curr_x = approach(curr_x, target_x, step);
                if (this.placeMeeting(curr_x, y)) {
                    return true;
                }
                if (step == 0) { return false; }
            }
            return false;
        }
    }

    
    isCollidingY(x = this.x, y = this.y, yspd = this.spd.x) {
        if (this.collisionType === 'discrete') {
            return this.placeMeeting(x, y + yspd);
        }
        else { // continuous
            let target_y = y + yspd;
            let curr_y = y;

            let step = Math.max( Math.abs( target_y - curr_y ) / this.collisionPrecision, 1) * Math.sign( target_y - curr_y );

            while(curr_y != target_y) {
                curr_y = approach(curr_y, target_y, step);
                if (this.placeMeeting(x, curr_y)) {
                    return true;
                }
                if (step == 0) { return false; }
            }
            return false;
        }
    }
}