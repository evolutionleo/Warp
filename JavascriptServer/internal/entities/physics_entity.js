import Entity from '#concepts/entity';

import { clamp, approach } from '#util/maths';

export default class PhysicsEntity extends Entity {
    static stuckAction = {
        stop: 'stop',
        clip: 'clip'
    };

    static outsideRoomAction = {
        stop: 'stop',
        wrap: 'wrap'
    };

    static collisionType = {
        discrete: 'discrete',
        continuout: 'continuout'
    };

    physicsEnabled = true;
    
    grv = { x: 0, y: 0.4 };
    max_spd = { x: 20, y: 20 };
    
    outsideRoomAction = PhysicsEntity.outsideRoomAction.stop;
    collisionType = PhysicsEntity.collisionType.discrete; // discrete or continuout
    collisionPrecision = 5; // only works with collisionType != 'discrete'
    
    preciseCollisions = true; // pixel-perfect, but is slower
    
    stuckAction = PhysicsEntity.stuckAction.stop; // or 'clip' to clip through walls
    
    constructor(room, x = 0, y = 0) {
        super(room, x, y);
    }
    
    move(xspd = undefined, yspd = 0) {
        // default move
        let def_move = xspd == undefined;
        if (def_move) {
            xspd = this.spd.x;
            yspd = this.spd.y;
        }
        
        
        // stuck in a solid object
        if (this.stuck()) {
            // just clip through everything?
            if (this.stuckAction ===  PhysicsEntity.stuckAction.clip) {
                this.x += xspd;
                this.y += yspd;
            }
            return; // help me im stuck
        }
        
        
        if (this.isCollidingX(this.x, this.y, xspd)) {
            if (this.preciseCollisions && xspd !== 0) {
                while (!this.isCollidingX(this.x, this.y, Math.sign(xspd))) {
                    this.x += Math.sign(xspd);
                }
            }
            if (def_move)
                this.spd.x = 0;
            xspd = 0;
        }
        if (this.outsideRoomAction === PhysicsEntity.outsideRoomAction.stop && this.isOutsideRoom(this.x + xspd, this.y)) {
            if (def_move)
                this.spd.x = 0;
            xspd = 0;
        }
        this.x += xspd;
        this.updateCollider();
        
        if (this.isCollidingY(this.x, this.y, yspd)) {
            if (this.preciseCollisions && yspd !== 0) {
                while (!this.isCollidingY(this.x, this.y, Math.sign(yspd))) {
                    this.y += Math.sign(yspd);
                }
            }
            if (def_move)
                this.spd.y = 0;
            yspd = 0;
        }
        if (this.outsideRoomAction ===  PhysicsEntity.outsideRoomAction.stop && this.isOutsideRoom(this.x, this.y + yspd)) {
            if (def_move) {
                this.spd.y = 0;
            }
            yspd = 0;
        }
        this.y += yspd;
        this.updateCollider();
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
    
    
    grounded(x = this.x, y = this.y, type = undefined) {
        return this.placeMeeting(x, y + 1, type);
    }
    
    
    
    wrapOutsideRoom() {
        if (this.outsideRoomAction !==  PhysicsEntity.outsideRoomAction.wrap || !this.isOutsideRoom())
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
        if (this.collisionType === PhysicsEntity.collisionType.discrete) {
            return this.placeMeeting(x + xspd, y);
        }
        else { // continuous
            let target_x = x + xspd;
            let curr_x = x;
            
            let step = Math.max(Math.abs(target_x - curr_x) / this.collisionPrecision, 1) * Math.sign(target_x - curr_x);
            
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
        if (this.collisionType === PhysicsEntity.collisionType.discrete) {
            return this.placeMeeting(x, y + yspd);
        }
        else { // continuous
            let target_y = y + yspd;
            let curr_y = y;
            
            let step = Math.max(Math.abs(target_y - curr_y) / this.collisionPrecision, 1) * Math.sign(target_y - curr_y);
            
            while (curr_y !== target_y) {
                curr_y = approach(curr_y, target_y, step);
                if (this.placeMeeting(x, curr_y)) {
                    return true;
                }
                if (step === 0) {
                    return false;
                }
            }
            return false;
        }
    }
}
