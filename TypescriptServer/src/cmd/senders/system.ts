import SendStuff from "#cmd/sendStuff";
import { ValidationError } from "fastest-validator";

declare module '#cmd/sendStuff' {
    interface SendStuff {
        sendServerInfo(compatible:boolean):void
        sendPing():void
        sendPong(T:number):void
        sendServerTime(client_t:number):void
        sendInvalidInput(from_cmd:string, errors:ValidationError[]):void
        sendError(error:string, details?:string):void
        sendKick():void
    }
}

/**
 * @param {boolean} compatible
 */
SendStuff.prototype.sendServerInfo = function(compatible:boolean = true):void {
    this.send({cmd: 'server info', meta: global.config.meta, compatible });
}


SendStuff.prototype.sendPing = function() {
    let T = new Date().getTime() - global.start_time;
    this.send({ cmd: 'ping', T });
}

/**
 * @param {number} T
 */
SendStuff.prototype.sendPong = function(T: number) {
    this.send({ cmd: 'pong', T });
}

SendStuff.prototype.sendServerTime = function(client_t: number) {
    this.send({ cmd: 'server timestamp', ct: client_t }); // data.t will be appended automatically if timestamps are enabled
}

SendStuff.prototype.sendInvalidInput = function(from_cmd:string, errors: ValidationError[]) {
    this.send({ cmd: 'invalid input', c: from_cmd, e: errors });
}

SendStuff.prototype.sendError = function(error:string, details:string='') {
    this.send({ cmd: 'error', error, details });
}

SendStuff.prototype.sendKick = function() {
    this.send({ cmd: 'server kick' });
}