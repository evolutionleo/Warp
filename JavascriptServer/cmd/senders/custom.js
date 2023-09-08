import SendStuff from "#cmd/sendStuff";

/**
 * @param {PlayerInputs} data
 */
SendStuff.prototype.sendPlayerControls = function (data) {
    let id = this.entity.uuid;
    this.broadcastRoom({ cmd: 'player controls', id, ...data }, true);
};
