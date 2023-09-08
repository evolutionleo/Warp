import SendStuff from "#cmd/sendStuff";

/**
 * @param {Match} match
 */
SendStuff.prototype.sendMatchFound = function (match) {
    this.send({ cmd: 'match found', match: match.serialize() });
};

SendStuff.prototype.sendMatchFinding = function (ticket) {
    this.send({ cmd: 'match finding', ticket: ticket.getInfo() });
};

/**
 * @param {string} reason
 */
SendStuff.prototype.sendMatchDenied = function (reason = '') {
    this.send({ cmd: 'match denied', reason });
};

/**
 * @param {number} delta
 * @param {number} new_mmr
 */
SendStuff.prototype.sendMMRChange = function (delta, new_mmr) {
    this.send({ cmd: 'mmr change', delta, new_mmr });
};
