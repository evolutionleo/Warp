import Client from "#concepts/client";
import Account, { IProfile } from "#schemas/profile";

import { ObjectId } from "mongoose";

import ChatLog, { IChatLog, IMessage } from "#schemas/chat";

export { IChatLog, IMessage };


export function chatFind(chat_id:string) {
    return global.chats[chat_id];
}

export function chatCreate(members:IProfile[] = []) {
    let chat = new Chat(new ChatLog());

    for(let member of members) {
        chat.addMember(member, true);
    }

    chat.save();

    let chat_id = chat.chat_id;
    global.chats[chat_id] = chat;
}

export class Chat {
    chatlog: IChatLog;

    online_members: Client[];
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


    addMember(profile: IProfile, initial = false) {
        if (this.members.includes(profile.id))
            return;

        profile.chats.push(this.chatlog.id);
        this.members.push(profile.id);

        if (!initial)
            this.save();
    }

    kickMember(profile: IProfile) {
        let idx = this.members.indexOf(profile.id);
        if (idx !== -1)
            this.members.splice(idx, 1);

        // disconnect the client
        idx = this.online_members.indexOf(profile.id);
        if (idx !== -1) {
            let client = this.online_members[idx];
            this.online_members.splice(idx, 1);

            idx = client.chats.indexOf(this);
            if (idx !== -1)
                client.chats.splice(idx, 1);
        }
        

        // cut this chat from the profile's chats list
        idx = profile.chats.indexOf(this.chatlog.id);
        if (idx !== -1)
            profile.chats.splice(idx, 1);
        
        this.save();
    }

    connectMember(client: Client) {
        if (this.online_members.includes(client))
            return;

        this.online_members.push(client);
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