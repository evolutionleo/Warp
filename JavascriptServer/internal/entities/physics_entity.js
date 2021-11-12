import Entity from '#concepts/entity';
import { clamp, approach } from '#util/maths';
export default class PhysicsEntity extends Entity {
    constructor(room, x = 0, y = 0) {
        super(room, x, y);
        this.physicsEnabled = true;
        this.grv = { x: 0, y: 0.4 };
        this.max_spd = { x: 20, y: 20 };
        this.outsideRoomAction = 'stop';
        this.collisionType = 'discrete';
        this.collisionPrecision = 5; // only works with collisionType = 'discrete'
        this.preciseCollisions = true; // pixel-perfect, but is slower
    }
    isOutsideRoom(x = this.x, y = this.y) {
        return this.bbox.left > this.room.width
            || this.bbox.right < 0
            || this.bbox.bottom < 0
            || this.bbox.top > this.room.height;
    }
    move(xspd = undefined, yspd = 0) {
        // default move
        let def_move = xspd == undefined;
        if (def_move) {
            xspd = this.spd.x;
            yspd = this.spd.y;
        }
        if (this.isCollidingX(this.x, this.y, xspd)) {
            if (this.preciseCollisions && xspd != 0) {
                while (!this.isCollidingX(this.x, this.y, Math.sign(xspd))) {
                    this.x += Math.sign(xspd);
                }
            }
            if (def_move)
                this.spd.x = 0;
            xspd = 0;
        }
        if (this.outsideRoomAction === 'stop' && this.isOutsideRoom(this.x + xspd, this.y)) {
            if (def_move)
                this.spd.x = 0;
            xspd = 0;
        }
        this.x += xspd;
        if (this.isCollidingY(this.x, this.y, yspd)) {
            if (this.preciseCollisions && yspd != 0) {
                while (!this.isCollidingY(this.x, this.y, Math.sign(yspd))) {
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
    grounded(x = this.x, y = this.y, type = undefined) {
        return this.placeMeeting(x, y + 1, type);
    }
    wrapOutsideRoom() {
        if (this.outsideRoomAction !== 'wrap' || !this.isOutsideRoom())
            return false;
        let tryWrap = (x, y) => {
            if (!this.placeMeeting(x, y)) {
                this.x = x;
                this.y = y;
            }
        };
        if (this.bbox.left > this.room.width) {
            tryWrap(this.x - this.bbox.right + 0, this.y);
        }
        else if (this.bbox.right < 0) {
            tryWrap(this.bbox.left - this.x + this.room.width, this.y);
        }
        if (this.bbox.bottom < 0) {
            tryWrap(this.x, this.bbox.bottom - this.y + this.room.height);
        }
        else if (this.bbox.top > this.room.height) {
            tryWrap(this.x, this.y - this.bbox.top + 0);
        }
    }
    isCollidingX(x = this.x, y = this.y, xspd = this.spd.x) {
        if (this.collisionType === 'discrete') {
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
            let step = Math.max(Math.abs(target_y - curr_y) / this.collisionPrecision, 1) * Math.sign(target_y - curr_y);
            while (curr_y != target_y) {
                curr_y = approach(curr_y, target_y, step);
                if (this.placeMeeting(x, curr_y)) {
                    return true;
                }
            }
            return false;
        }
    }
}
