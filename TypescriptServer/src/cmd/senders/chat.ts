import SendStuff from "#cmd/sendStuff";
import Chat from "#concepts/chat";
import { IMessage, messageSerialize } from "#schemas/chat";

declare module '#cmd/sendStuff' {
    interface SendStuff {
        sendChatMessage(chat_id:string, message:IMessage):void
        sendChatHistory(chat_id:string, messages:IMessage[]):void
        sendChatInfo(chat:Chat):void
        sendChatsList():void
    }
}

SendStuff.prototype.sendChatMessage = function(chat_id:string, message:IMessage) {
    this.send({ cmd: 'chat msg', chat_id, message: messageSerialize(message) });
}

SendStuff.prototype.sendChatHistory = function(chat_id:string, messages:IMessage[]) {
    // this.send({ cmd: 'chat history', chat_id, history: messages.map(m => ({ content: m.content, name: m.name, profile_id: null })) });
    this.send({ cmd: 'chat history', chat_id, history: messages.map(messageSerialize) })
}

SendStuff.prototype.sendChatInfo = function(chat:Chat) {
    this.send({ cmd: 'chat info', chat: chat.serialize() });
}

SendStuff.prototype.sendChatsList = function() {
    this.send({ cmd: 'chats list', chats: this.chats.map(chat => chat.chat_id) });
}