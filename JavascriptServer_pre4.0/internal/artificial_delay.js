const crypto = require('crypto');

// this file is used to immitate delay/latency of the connection

module.exports.delaySend = class {
    static enabled = false;

    static min = 100;
    static max = 2000;

    static get() {
        if (!this.enabled)
            return -1;
        return crypto.randomInt(this.min, this.max);
    }
}

module.exports.delayReceive = class {
    static enabled = false;

    static min = 100;
    static max = 2000;
    
    static get() {
        if (!this.enabled)
            return -1;
        return crypto.randomInt(this.min, this.max);
    }
}