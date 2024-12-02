import SendStuff from "#cmd/sendStuff";
import { IMessage } from "#schemas/chat";

declare module '#cmd/sendStuff' {
    interface SendStuff {
        sendChatMessage(chat_id:string, message:IMessage):void
        // sendSomething():void
    }
}

/**
 * @param {}
 */
// SendStuff.prototype.sendSomething = function() {
//     this.send({ cmd: '',  })
// }