import { Schema, Model, ObjectId, model, Document } from 'mongoose'

export interface ISession extends Document {
    token: string,
    account_id: ObjectId,
    updatedAt: Date,
    createdAt: Date
}

export const SessionSchema = new Schema<ISession>({
    token: { type: String, index: true },
    account_id: { type: Schema.Types.ObjectId, ref: 'Account' }
}, { timestamps: true });


export const Session = model('Session', SessionSchema, 'Sessions');
export default Session;