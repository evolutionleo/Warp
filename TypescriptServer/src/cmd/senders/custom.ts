import SendStuff from "#cmd/sendStuff"
import Client from "#concepts/client"
import { PlayerInputs } from "#entities/player"

declare module "#cmd/sendStuff" {
    interface SendStuff {
        sendPlayerControls(data: PlayerInputs)
    }
}

/**
 * @param {PlayerInputs} data 
 */
SendStuff.prototype.sendPlayerControls = function(data: PlayerInputs) {
    let id = this.entity.uuid;
    this.broadcastRoom({ cmd: 'player controls', id, ...data }, true);
}