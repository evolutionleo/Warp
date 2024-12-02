import Chat from "#concepts/chat";
import ChatLog from "#schemas/chat";

const chatLogs = await ChatLog.find({});
chatLogs.forEach(chatlog => {
    let chat = new Chat(chatlog);
    global.chats[chat.chat_id] = chat;
})