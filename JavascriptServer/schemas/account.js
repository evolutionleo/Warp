// this section contains a schema for saving players' account info
import { model, Schema } from 'mongoose';

// you can edit this schema!
const accountSchema = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    
    // you can add additional properties to the schema below
    // if using TypeScript - (don't forget to also update the IAccount interface):
    
});

export const Account = model('Account', accountSchema, 'Accounts');
export default Account;

export function getAccountInfo(a) {
    if (a === null)
        return null;
    
    return {
        id: a.id,
        username: a.username
    };
}
