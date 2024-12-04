
import ChatLog from "#schemas/chat";
import { getRandomId } from "#util/random_id";


export function chatFind(chat_id) {
    return global.chats[chat_id];
}

export function chatCreate(members = [], isPrivate = false) {
    let chat_id = getRandomId(global.chats);
    if (chat_id === null)
        return null;
    
    let chatlog = new ChatLog();
    
    chatlog._id = chat_id;
    chatlog.private = isPrivate;
    
    let chat = new Chat(chatlog);
    
    
    for (let member of members) {
        chat.addMember(member, null, true);
    }
    
    chat.save();
    global.chats[chat_id] = chat;
    
    return chat;
}

export class Chat {
    chatlog;
    
    online_members = [];
    get messages() {
        return this.chatlog.messages;
    }
    
    
    // id of the chat room
    get chat_id() {
        return this.chatlog.id.toString();
    }
    
    get members() {
        return this.chatlog.members;
    }
    
    constructor(chatlog) {
        this.chatlog = chatlog;
    }
    
    save() {
        return this.chatlog.save();
    }
    
    
    addMember(profile, client = null, initial = false) {
        if (this.members.includes(profile.id))
            return;
        
        profile.chats.push(this.chatlog.id);
        this.members.push(profile.id);
        
        if (client !== null)
            this.connectMember(client);
        
        if (!initial)
            this.save();
    }
    
    kickMember(profile) {
        let idx = this.members.indexOf(profile.id);
        if (idx !== -1)
            this.members.splice(idx, 1);
        
        // disconnect the client
        idx = this.online_members.findIndex(c => c.profile === profile);
        if (idx !== -1) {
            let client = this.online_members[idx];
            this.disconnectMember(client);
        }
        
        
        // cut this chat from the profile's chats list
        idx = profile.chats.indexOf(this.chatlog.id);
        if (idx !== -1)
            profile.chats.splice(idx, 1);
        
        this.save();
    }
    
    connectMember(client) {
        if (!this.online_members.some(c => (c === client || c.profile?.id === client.profile?.id)))
            this.online_members.push(client);
        
        if (!client.chats.includes(this))
            client.chats.push(this);
        
        client.sendChatHistory(this.chat_id, this.messages);
    }
    
    disconnectMember(client) {
        let idx = this.online_members.indexOf(client);
        if (idx !== -1)
            this.online_members.splice(idx, 1);
        
        idx = client.chats.indexOf(this);
        if (idx !== -1)
            client.chats.splice(idx, 1);
    }
    
    writeMessage(content, author = 'SYSTEM') {
        let name, profile_id;
        
        // author is not logged in/anonymous
        if (typeof author === 'string') {
            name = author;
            profile_id = null;
        }
        else {
            name = author.name;
            profile_id = author.profile?.id ?? null;
        }
        
        const message = {
            name,
            content,
            profile_id
        };
        
        this.messages.push(message);
        this.save();
        
        // broadcast to all online users
        this.online_members.forEach(client => client.sendChatMessage(this.chat_id, message));
    }
    
    serialize() {
        return {
            chat_id: this.chat_id,
            members: this.members.map(profile_id => profile_id.toString()),
            online_members: this.online_members.map(client => client.name)
        };
    }
}

export default Chat;
