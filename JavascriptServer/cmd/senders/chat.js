import SendStuff from "#cmd/sendStuff";
import { messageSerialize } from "#schemas/chat";

SendStuff.prototype.sendChatMessage = function (chat_id, message) {
    this.send({ cmd: 'chat msg', chat_id, message: messageSerialize(message) });
};

SendStuff.prototype.sendChatHistory = function (chat_id, messages) {
    // this.send({ cmd: 'chat history', chat_id, history: messages.map(m => ({ content: m.content, name: m.name, profile_id: null })) });
    this.send({ cmd: 'chat history', chat_id, history: messages.map(messageSerialize) });
};

SendStuff.prototype.sendChatInfo = function (chat) {
    this.send({ cmd: 'chat info', chat: chat.serialize() });
};

SendStuff.prototype.sendChatsList = function () {
    this.send({ cmd: 'chats list', chats: this.chats.map(chat => chat.chat_id) });
};
