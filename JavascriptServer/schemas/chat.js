// this section contains a schema for saving players' account info
import { model, Schema } from 'mongoose';

// for some reason trying to msgpack.encode message with ObjectId leads to a circular reference (???)
export function messageSerialize(msg) {
    return {
        name: msg.name,
        content: msg.content,
        profile_id: msg.profile_id?.toString()
    };
}

const messageSchema = new Schema({
    profile_id: { type: Schema.Types.ObjectId, ref: 'Profile', required: false },
    name: String,
    content: String
}, { _id: false });

// you can edit this schema!
const chatSchema = new Schema({
    _id: { type: String, unique: true, index: true },
    
    private: { type: Boolean, default: false },
    type: { type: String, default: 'group' },
    messages: [messageSchema],
    members: [
        { type: Schema.Types.ObjectId, ref: 'Profile' }
    ]
});


export const ChatLog = model('Chat', chatSchema, 'Chats');
export default ChatLog;
