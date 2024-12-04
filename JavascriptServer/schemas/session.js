import { Schema, model } from 'mongoose';

export const SessionSchema = new Schema({
    token: { type: String, index: true },
    account_id: { type: Schema.Types.ObjectId, ref: 'Account' }
}, { timestamps: true });


export const Session = model('Session', SessionSchema, 'Sessions');
export default Session;
