import Client from "#concepts/client";
import Account, { IProfile } from "#schemas/profile";

import { ObjectId } from "mongoose";


export interface IMessage {
    profile_id: ObjectId | string;
    name: string;
    content: string;
}

export class Message implements IMessage {
    id: number;
    profile_id: string;
    name: string;
    content: string;
}

// export class Chat {
//     chat_id: string; // id of the chat room
//     online_members: Client[];
//     members: string[]; // profile_id[]
//     messages: Message[];

//     constructor(members?: Client[]) {
//         if (members) {
//             for(let member in members) {
//                 this.addMember(member);
//             }
//         }
        
//     }

//     async save() {

//     }

//     addMember(member: Client) {
//         this.members.push(member);
//     }

//     kickMember(member: Client) {
//         let idx = this.members.indexOf(member);
//         this.members.splice(idx, 1);
//     }

//     disconnectMember(member: Client) {
        
//     }
// }

// export class GlobalChat extends Chat {
//     constructor() {
//         super(global.clients);
//     }
// }

// export class DirectChat extends Chat {
//     constructor(client1:Client, client2:Client) {
//         super([client1, client2]);
//     }
// }

// export class GroupChat extends Chat {
//     constructor(members: Client[]) {
//         super(members);
//     }
// }