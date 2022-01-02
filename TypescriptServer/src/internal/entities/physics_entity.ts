import Point from '#types/point';
import Entity from '#concepts/entity';
import Room from '#concepts/room';

import { clamp, approach } from '#util/maths';

// 'ignore' means the entity would just go outside bounds
export type OutsideRoomAction = 'wrap' | 'stop' | 'ignore';
export type CollisionType = 'discrete' | 'continuous';

export default class PhysicsEntity extends Entity {
    physicsEnabled:boolean = true;

    grv:Point = { x: 0, y: 0.4 };
    max_spd:Point = {x: 20, y: 20};

    outsideRoomAction: OutsideRoomAction = 'stop';
    collisionType:CollisionType = 'discrete';
    collisionPrecision:number = 5; // only works with collisionType = 'discrete'

    preciseCollisions = true; // pixel-perfect, but is slower

    constructor(room:Room, x: number = 0, y: number = 0) {
        super(room, x, y);
    }


    isOutsideRoom(x = this.x, y = this.y):boolean {
        let bbox = this.bbox; // this is an optimization btw

        return bbox.left - this.x + x > this.room.width
            || bbox.right - this.x + x < 0
            || bbox.bottom - this.y + y < 0
            || bbox.top - this.y + y > this.room.height;
    }

    move(xspd:number = undefined, yspd:number = 0):void {
        // default move
        let def_move = xspd == undefined;
        if (def_move) {
            xspd = this.spd.x;
            yspd = this.spd.y;
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
    }

    update() {
        this.spd.x += this.grv.x;
        this.spd.y += this.grv.y;

        this.spd.x = clamp(this.spd.x, -this.max_spd.x, this.max_spd.x);
        this.spd.y = clamp(this.spd.y, -this.max_spd.y, this.max_spd.y);

        this.move();
        this.wrapOutsideRoom();

        super.update();
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
            }
            return false;
        }
    }
}