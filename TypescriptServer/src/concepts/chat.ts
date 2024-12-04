import Client from "#concepts/client";
import Account, { IProfile } from "#schemas/profile";

import { ObjectId } from "mongoose";

import ChatLog, { IChatLog, IMessage } from "#schemas/chat";
import { getRandomId } from "#util/random_id";

export { IChatLog, IMessage };


export function chatFind(chat_id:string) {
    return global.chats[chat_id];
}

export function chatCreate(members:IProfile[] = [], isPrivate = false) {
    let chat_id:string = getRandomId(global.chats);
    if (chat_id === null) return null;
    
    let chatlog = new ChatLog();

    chatlog._id = chat_id;
    chatlog.private = isPrivate;

    let chat = new Chat(chatlog);


    for(let member of members) {
        chat.addMember(member, null, true);
    }

    chat.save();
    global.chats[chat_id] = chat;

    return chat;
}

export interface SerializedChat {
    chat_id: string,
    online_members: string[],
    members: string[]
}

export class Chat {
    chatlog: IChatLog;

    online_members: Client[] = [];
    get messages(): IMessage[] {
        return this.chatlog.messages;
    }


    // id of the chat room
    get chat_id(): string {
        return this.chatlog.id.toString();
    }

    get members():ObjectId[] {
        return this.chatlog.members;
    }

    constructor(chatlog: IChatLog) {
        this.chatlog = chatlog;
    }

    save() {
        return this.chatlog.save();
    }


    addMember(profile: IProfile, client = null, initial = false) {
        if (this.members.includes(profile.id))
            return;

        profile.chats.push(this.chatlog.id);
        this.members.push(profile.id);

        if (client !== null)
            this.connectMember(client);

        if (!initial)
            this.save();
    }

    kickMember(profile: IProfile) {
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

    connectMember(client: Client) {
        if (!this.online_members.some(c => (c === client || c.profile?.id === client.profile?.id)))
            this.online_members.push(client);

        if (!client.chats.includes(this))
            client.chats.push(this);

        client.sendChatHistory(this.chat_id, this.messages);
    }

    disconnectMember(client: Client) {
        let idx = this.online_members.indexOf(client);
        if (idx !== -1)
            this.online_members.splice(idx, 1);

        idx = client.chats.indexOf(this);
        if (idx !== -1)
            client.chats.splice(idx, 1);
    }

    writeMessage(content: string, author: Client|string = 'SYSTEM') {
        let name:string, profile_id:string;

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
        }

        this.messages.push(message);
        this.save();

        // broadcast to all online users
        this.online_members.forEach(
            client => client.sendChatMessage(this.chat_id, message)
        );
    }

    serialize():SerializedChat {
        return {
            chat_id: this.chat_id,
            members: this.members.map(profile_id => profile_id.toString()),
            online_members: this.online_members.map(client => client.name)
        }
    }
}

export default Chat;