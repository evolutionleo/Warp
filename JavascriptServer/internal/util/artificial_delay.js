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
delaySend.min = 280;
delaySend.max = 300;
export class delayReceive {
    static get() {
        if (!this.enabled)
            return -1;
        return crypto.randomInt(this.min, this.max);
    }
}
delayReceive.enabled = false;
delayReceive.min = 280;
delayReceive.max = 300;
