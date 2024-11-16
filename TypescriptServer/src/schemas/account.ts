// this section contains a schema for saving players' account info
import { model, Schema, ObjectId, Document, Model } from 'mongoose';

export interface IAccount extends Document {
    temporary: boolean,
    username: string,
    password: string
}

// you can edit this schema!
const accountSchema = new Schema<IAccount>({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    
    // you can add additional properties to the schema below
    // if using TypeScript - (don't forget to also update the IAccount interface):

});

export const Account = model<IAccount>('Account', accountSchema, 'Accounts');
export default Account;


export type AccountInfo = {
    username: string
}

export function getAccountInfo(a:IAccount):AccountInfo {
    if (a === null) return null;

    return {
        username: a.username
    };
}