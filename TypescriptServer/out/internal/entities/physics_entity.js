import Entity from '#concepts/entity';
import { clamp } from '#util/maths';
export default class PhysicsEntity extends Entity {
    constructor(room, x = 0, y = 0) {
        super(room, x, y);
        this.grv = { x: 0, y: 0.3 };
        this.max_spd = { x: 20, y: 20 };
        this.outsideRoomAction = 'stop';
        this.collisionType = 'discrete';
        this.preciseCollisions = false;
    }
    create(x, y) {
        super.create(x, y);
    }
    outsideRoom() {
        switch (this.outsideRoomAction) {
            case 'ignore':
                return;
            case 'stop':
                return;
            case 'warp':
                return;
        }
    }
    move(xspd, yspd = 0) {
        // default move
        let def_move = xspd == undefined;
        if (def_move) {
            xspd = this.spd.x;
            yspd = this.spd.y;
        }
        if (this.placeMeeting(this.x + xspd, this.y)) {
            if (this.preciseCollisions && xspd != 0) {
                while (!this.placeMeeting(this.x + Math.sign(xspd), this.y)) {
                    this.x += Math.sign(xspd);
                }
            }
            if (def_move)
                this.spd.x = 0;
            xspd = 0;
        }
        this.x += xspd;
        if (this.placeMeeting(this.x, this.y + yspd)) {
            if (this.preciseCollisions && yspd != 0) {
                while (!this.placeMeeting(this.x, this.y + Math.sign(yspd))) {
                    this.y += Math.sign(yspd);
                }
            }
            if (def_move)
                this.spd.y = 0;
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
        // if (this.bbox.left > this.room.width) {
        // }
        // else if (this.bbox.right < 0) {
        // }
        // else if (this.bbox.bottom < 0) {
        // }
        // else if (this.bbox.top > this.room.height) {
        // }
        super.update();
    }
}
