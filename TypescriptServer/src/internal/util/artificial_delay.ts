import * as crypto from 'crypto';

// this file is used to immitate delay/latency of the connection

export class delaySend {
    static enabled = false;

    static min = 280;
    static max = 300;

    static get():number {
        if (!this.enabled)
            return -1;
        return crypto.randomInt(this.min, this.max);
    }
}

export class delayReceive {
    static enabled = false;

    static min = 280;
    static max = 300;
    
    static get():number {
        if (!this.enabled)
            return -1;
        return crypto.randomInt(this.min, this.max);
    }
}