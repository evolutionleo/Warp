import SendStuff from "#cmd/sendStuff";
import Match from "#matchmaking/match";
import Ticket from "#matchmaking/ticket";

declare module '#cmd/sendStuff' {
    interface SendStuff {
        sendMatchFound(match:Match):void
        sendMatchDenied(reason):void
        sendMMRChange(delta:number, new_mmr:number):void
        sendMatchFinding(ticket:Ticket):void
    }
}

/**
 * @param {Match} match
 */
SendStuff.prototype.sendMatchFound = function(match) {
    this.send({ cmd: 'match found', match: match.serialize() });
}

SendStuff.prototype.sendMatchFinding = function(ticket:Ticket) {
    this.send({ cmd: 'match finding', ticket: ticket.getInfo() });
}

/**
 * @param {string} reason
 */
SendStuff.prototype.sendMatchDenied = function(reason:string = '') {
    this.send({ cmd: 'match denied', reason });
}

/**
 * @param {number} delta
 * @param {number} new_mmr
 */
SendStuff.prototype.sendMMRChange = function(delta, new_mmr) {
    this.send({ cmd: 'mmr change', delta, new_mmr });
}