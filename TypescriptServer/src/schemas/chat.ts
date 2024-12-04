// this section contains a schema for saving players' account info
import { model, Schema, ObjectId, Document, Model } from 'mongoose';


export type ChatType = 'global' | 'direct' | 'group';

export interface IMessage {
    profile_id?: ObjectId | string;
    name: string;
    content: string;
}

export interface SerializedMessage {
    profile_id?: string;
    name: string;
    content: string;
}

// for some reason trying to msgpack.encode message with ObjectId leads to a circular reference (???)
export function messageSerialize(msg:IMessage):SerializedMessage {
    return {
        name: msg.name,
        content: msg.content,
        profile_id: msg.profile_id?.toString()
    }
}

const messageSchema = new Schema<IMessage>({
    profile_id: { type: Schema.Types.ObjectId, ref: 'Profile', required: false },
    name: String,
    content: String
}, { _id: false });

export interface IChatLog extends Document {
    _id: string,
    type: ChatType,
    private: boolean,
    messages: IMessage[],
    members: ObjectId[]
}

// you can edit this schema!
const chatSchema = new Schema<IChatLog>({
    _id: { type: String, unique: true, index: true },

    private: { type: Boolean, default: false },
    type: { type: String, default: 'group' },
    messages: [messageSchema],
    members: [
        { type: Schema.Types.ObjectId, ref: 'Profile' }
    ]
});


export const ChatLog:Model<IChatLog> = model<IChatLog, Model<IChatLog>>('Chat', chatSchema, 'Chats');
export default ChatLog;