import * as crypto from 'crypto';
// this file is used to immitate delay/latency of the connection
export class delaySend {
    static get() {
        if (!this.enabled)
            return -1;
        return crypto.randomInt(this.min, this.max);
    }
}
delaySend.enabled = false;
delaySend.min = 100;
delaySend.max = 2000;
export class delayReceive {
    static get() {
        if (!this.enabled)
            return -1;
        return crypto.randomInt(this.min, this.max);
    }
}
delayReceive.enabled = false;
delayReceive.min = 100;
delayReceive.max = 2000;
