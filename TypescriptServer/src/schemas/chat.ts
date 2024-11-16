// this section contains a schema for saving players' account info

import { IMessage } from '#concepts/chat';
import trace from '#util/logging';

import { model, Schema, ObjectId, Document, Model } from 'mongoose';


export interface IChatLog {
    messages: IMessage[]
}

// you can edit this schema!
const chatSchema = new Schema<IChatLog>({
    messages: [{
        profile_id: { type: Schema.Types.ObjectId, ref: 'Profile' },
        name: String,
        content: String
    }]
    
    // you can add additional properties to the schema here:
});

export const ChatLog:Model<IChatLog> = model<IChatLog, Model<IChatLog>>('ChatLog', chatSchema, 'ChatLogs');
export default ChatLog;