import SendStuff from "#cmd/sendStuff"
import Client from "#concepts/client"
import { IPlayerInputs } from "#entity/player"

declare module "#cmd/sendStuff" {
    interface SendStuff {
        sendPlayerControls(data: IPlayerInputs)
    }
}

/**
 * @param {IPlayerInputs} data 
 */
SendStuff.prototype.sendPlayerControls = function(data: IPlayerInputs) {
    let id = this.entity.uuid;
    this.broadcastRoom({ cmd: 'player controls', id, ...data }, true);
}