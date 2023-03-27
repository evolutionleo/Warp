// this section contains a schema for saving players' account info
import trace from '#util/logging';

import mongoose from 'mongoose';
const { model, Schema }  = mongoose;
import { hashPassword, verifyPassword } from '#util/password_encryption';

// you can edit this schema!
const accountSchema = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    // you can add additional properties to the schema here:
}, { collection: 'Accounts' });


// logging in/registering stuff
accountSchema.statics.register = function accountRegister(username, password) {
    return new Promise(async (resolve, reject) => {
        var account = new Account({
            username: username,
            password: await hashPassword(password),
            
            // you can add more stuff below (you'll also need to define it in the Account Schema above)
        });
        
        account.save(function (err) {
            if (err) {
                trace('Error while registering: ' + err.message);
                reject('failed to register');
            }
            else {
                resolve(account);
            }
        });
    });
};

accountSchema.statics.login = function accountLogin(username, password) {
    return new Promise(async (resolve, reject) => {
        Account.findOne({ username: username }, async (err, account) => {
            if (!account) {
                reject('account not found');
            }
            else if (err) {
                trace(err);
                reject('error while logging in');
            }
            else {
                if (await verifyPassword(password, account.password)) {
                    resolve(account);
                }
                else {
                    reject('wrong password');
                }
            }
        });
    });
};

export const Account = model('Account', accountSchema);
export default Account;

export function getAccountInfo(a) {
    if (a === null)
        return null;
    
    return {
        username: a.username
    };
}
