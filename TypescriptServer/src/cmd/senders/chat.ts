import SendStuff from "#cmd/sendStuff";
import { IMessage } from "#schemas/chat";

declare module '#cmd/sendStuff' {
    interface SendStuff {
        sendChatMessage(chat_id:string, message:IMessage):void
        sendChatHistory(chat_id:string, messages:IMessage[]):void
    }
}

SendStuff.prototype.sendChatMessage = function(chat_id:string, message:IMessage) {
    this.send({ cmd: 'chat msg', chat_id, message });
}

SendStuff.prototype.sendChatHistory = function(chat_id:string, messages:IMessage[]) {
    this.send({ cmd: 'chat history', chat_id, history: messages });
}