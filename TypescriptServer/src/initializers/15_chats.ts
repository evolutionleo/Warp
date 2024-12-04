import Chat, { chatCreate } from "#concepts/chat";
import ChatLog from "#schemas/chat";

// create instances of every chat from the DB
const chatLogs = await ChatLog.find({});
chatLogs.forEach(chatlog => {
    let chat = new Chat(chatlog);
    global.chats[chat.chat_id] = chat;
});


// create a new id=0 "global" chat if it doesn't exist already
if (global.chats['0'] === undefined) {
    let chatlog = new ChatLog();
    chatlog._id = '0';

    let chat = new Chat(chatlog);
    global.chats['0'] = chat;
}

// chatCreate([]);