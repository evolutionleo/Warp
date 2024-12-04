import addHandler from "#cmd/handlePacket";

// list of all the chats of this player
addHandler('chats list', (c, data) => {
    c.sendChatsList();
});