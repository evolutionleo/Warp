import Entity from '#concepts/entity';

import { clamp, approach } from '#util/maths';

export default class PhysicsEntity extends Entity {
    physicsEnabled = true;
    
    grv = { x: 0, y: 800 };
    max_spd = { x: 2000, y: 2000 };
    
    outside_room_action = 'stop';
    collision_type = 'discrete'; // discrete or continuout
    collision_precision = 5; // only works with collision_type != 'discrete'
    
    precise_collisions = true; // pixel-perfect, but is slower
    
    stuck_action = 'stop'; // or 'clip' to clip through walls
    
    constructor(room, x = 0, y = 0) {
        super(room, x, y);
    }
    
    move(xspd = undefined, yspd = 0, dt = this.room.dt) {
        // default move
        let def_move = xspd == undefined;
        if (def_move) {
            xspd = this.spd.x;
            yspd = this.spd.y;
        }
        
        xspd *= dt;
        yspd *= dt;
        
        xspd = this.roundedPos(xspd);
        yspd = this.roundedPos(yspd);
        
        // stuck in a solid object
        if (this.stuck()) {
            // just clip through everything?
            if (this.stuck_action === 'clip') {
                this.x += xspd;
                this.y += yspd;
            }
            return; // help me im stuck
        }
        
        if (this.isCollidingX(this.x, this.y, xspd)) {
            if (this.precise_collisions && xspd != 0) {
                while (!this.isCollidingX(this.x, this.y, Math.sign(xspd))) {
                    this.x += Math.sign(xspd);
                }
            }
            if (def_move)
                this.spd.x = 0;
            xspd = 0;
        }
        if (this.outside_room_action === 'stop' && this.isOutsideRoom(this.x + xspd, this.y)) {
            if (def_move)
                this.spd.x = 0;
            xspd = 0;
        }
        this.x += xspd;
        this.updateCollider();
        
        if (this.isCollidingY(this.x, this.y, yspd)) {
            if (this.precise_collisions && yspd != 0) {
                while (!this.isCollidingY(this.x, this.y, Math.sign(yspd))) {
                    this.y += Math.sign(yspd);
                }
            }
            if (def_move)
                this.spd.y = 0;
            yspd = 0;
        }
        if (this.outside_room_action === 'stop' && this.isOutsideRoom(this.x, this.y + yspd)) {
            if (def_move) {
                this.spd.y = 0;
            }
            yspd = 0;
        }
        this.y += yspd;
        this.updateCollider();
    }
    
    update(dt = 1) {
        this.spd.x += this.grv.x * dt;
        this.spd.y += this.grv.y * dt;
        
        this.spd.x = clamp(this.spd.x, -this.max_spd.x, this.max_spd.x);
        this.spd.y = clamp(this.spd.y, -this.max_spd.y, this.max_spd.y);
        
        this.move();
        this.wrapOutsideRoom();
        
        super.update(dt);
    }
    
    
    grounded(x = this.x, y = this.y, type = undefined) {
        return this.placeMeeting(x, y + 1, type);
    }
    
    
    
    wrapOutsideRoom() {
        if (this.outside_room_action !== 'wrap' || !this.isOutsideRoom())
            return false;
        
        let tryWrap = (x, y) => {
            if (!this.placeMeeting(x, y)) {
                this.x = x;
                this.y = y;
            }
        };
        
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
        if (this.collision_type === 'discrete') {
            return this.placeMeeting(x + xspd, y);
        }
        else { // continuous
            let target_x = x + xspd;
            let curr_x = x;
            
            let step = Math.max(Math.abs(target_x - curr_x) / this.collision_precision, 1) * Math.sign(target_x - curr_x);
            
            while (curr_x != target_x) {
                curr_x = approach(curr_x, target_x, step);
                if (this.placeMeeting(curr_x, y)) {
                    return true;
                }
                if (step == 0) {
                    return false;
                }
            }
            return false;
        }
    }
    
    
    isCollidingY(x = this.x, y = this.y, yspd = this.spd.x) {
        if (this.collision_type === 'discrete') {
            return this.placeMeeting(x, y + yspd);
        }
        else { // continuous
            let target_y = y + yspd;
            let curr_y = y;
            
            let step = Math.max(Math.abs(target_y - curr_y) / this.collision_precision, 1) * Math.sign(target_y - curr_y);
            
            while (curr_y != target_y) {
                curr_y = approach(curr_y, target_y, step);
                if (this.placeMeeting(x, curr_y)) {
                    return true;
                }
                if (step == 0) {
                    return false;
                }
            }
            return false;
        }
    }
}
