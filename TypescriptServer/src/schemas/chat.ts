// this section contains a schema for saving players' account info
import { model, Schema, ObjectId, Document, Model } from 'mongoose';


export type ChatType = 'global' | 'direct' | 'group';

export interface IMessage {
    profile_id?: ObjectId | string;
    name: string;
    content: string;
}

const messageSchema = new Schema<IMessage>({
    profile_id: { type: Schema.Types.ObjectId, ref: 'Profile', required: false },
    name: String,
    content: String
}, { _id: false });

export interface IChatLog extends Document {
    _id: string,
    type: ChatType,
    messages: IMessage[],
    members: ObjectId[]
}

// you can edit this schema!
const chatSchema = new Schema<IChatLog>({
    _id: { type: String, unique: true, index: true },

    messages: [messageSchema],
    members: [
        { type: Schema.Types.ObjectId, ref: 'Profile' }
    ]
});


export const ChatLog:Model<IChatLog> = model<IChatLog, Model<IChatLog>>('Chat', chatSchema, 'Chats');
export default ChatLog;