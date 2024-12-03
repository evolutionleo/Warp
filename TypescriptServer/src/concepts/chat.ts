import Client from "#concepts/client";
import Account, { IProfile } from "#schemas/profile";

import { ObjectId } from "mongoose";

import ChatLog, { IChatLog, IMessage } from "#schemas/chat";
import { getRandomId } from "#util/random_id";

export { IChatLog, IMessage };


export function chatFind(chat_id:string) {
    return global.chats[chat_id];
}

export function chatCreate(members:IProfile[] = []) {
    let chat_id:string = getRandomId(global.chats);
    if (chat_id === null) return null;
    
    let chatlog = new ChatLog();

    chatlog._id = chat_id;
    let chat = new Chat(chatlog);

    for(let member of members) {
        chat.addMember(member, null, true);
    }

    chat.save();
    global.chats[chat_id] = chat;

    return chat;
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
    }

    disconnectMember(client: Client) {
        let idx = this.online_members.indexOf(client);
        if (idx !== -1)
            this.online_members.splice(idx, 1);

        idx = client.chats.indexOf(this);
        if (idx !== -1)
            client.chats.splice(idx, 1);
    }

    writeMessage(client: Client, content: string) {
        const message:IMessage = {
            profile_id: client.profile.id,
            name: client.name,
            content
        };
        this.messages.push(message);
        this.save();

        // broadcast to all online users
        this.online_members.forEach(
            member => member.sendChatMessage(this.chat_id, message)
        );
    }
}

export default Chat;

// export class GlobalChat extends Chat {
//     constructor() {
//         // super(global.clients);
//     }
// }

// export class DirectChat extends Chat {
//     constructor(client1:Client, client2:Client) {
//         // super([client1, client2]);
//     }
// }

// export class GroupChat extends Chat {
//     constructor(members: Client[]) {
//         // super(members);
//     }
// }