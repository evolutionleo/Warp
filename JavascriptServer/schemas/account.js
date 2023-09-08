// this section contains a schema for saving players' account info
import trace from '#util/logging';

import mongoose from 'mongoose';
const { model, Schema }  = mongoose;
import { hashPassword, verifyPassword } from '#util/password_encryption';
import { Names } from '#util/names';

// you can edit this schema!
const accountSchema = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    
    // you can add additional properties to the schema here:
}, { collection: 'Accounts' });


// logging in/registering stuff
accountSchema.statics.register = function accountRegister(username, password) {
    username = username.toLowerCase();
    
    return new Promise(async (resolve, reject) => {
        if (!Names.isValid(username)) {
            reject('failed to register');
        }
        
        var account = new Account({
            username: username,
            password: await hashPassword(password),
            
            // you can add more stuff below (you'll also need to define it in the Account Schema above)
        });
        
        account.save()
            .then((acc) => {
            resolve(acc);
        })
            .catch((err) => {
            trace('Error while registering: ' + err.message);
            reject('failed to register');
        });
    });
};

accountSchema.statics.login = function accountLogin(username, password) {
    username = username.toLowerCase();
    
    return new Promise(async (resolve, reject) => {
        Account.findOne({ username: username }).catch((err) => {
            if (err) {
                trace(err);
                reject('error while logging in');
            }
        }).then(async (account) => {
            if (!account) {
                reject('account not found');
            }
            else {
                if (await verifyPassword(password, account.password)) {
                    if (global.clients.some(c => c.account?.username?.toLowerCase() === account.username.toLowerCase())) {
                        reject('account is already logged into on another session');
                    }
                    else {
                        resolve(account);
                    }
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
