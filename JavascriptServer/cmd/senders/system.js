import SendStuff from "#cmd/sendStuff";

/**
 * @param {boolean} compatible
 */
SendStuff.prototype.sendServerInfo = function (compatible = true) {
    this.send({ cmd: 'server info', meta: global.config.meta, compatible });
};


SendStuff.prototype.sendPing = function () {
    let T = new Date().getTime() - global.start_time;
    this.send({ cmd: 'ping', T });
};

/**
 * @param {number} T
 */
SendStuff.prototype.sendPong = function (T) {
    this.send({ cmd: 'pong', T });
};

SendStuff.prototype.sendServerTime = function (client_t) {
    this.send({ cmd: 'server timestamp', ct: client_t }); // data.t will be appended automatically if timestamps are enabled
};

SendStuff.prototype.sendInvalidInput = function (from_cmd, errors) {
    this.send({ cmd: 'invalid input', c: from_cmd, e: errors });
};

SendStuff.prototype.sendError = function (error, details = '') {
    this.send({ cmd: 'error', error, details });
};
