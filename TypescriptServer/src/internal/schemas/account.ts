// this section contains a schema for saving players' account info
import trace from '#util/logging';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const mongoose = require('mongoose');
import { Model, Document } from 'mongoose';
const { Schema, model } = mongoose;

import { hash_password, verify_password } from '#util/password_encryption';
import { Profile } from '#schemas/profile';


export interface IAccount extends Document {
    username: string,
    password: string
}

export interface IAccountModel extends Model<IAccount> {
    login: (username:string, password:string) => Promise<string|IAccount>,
    register: (username:string, password:string) => Promise<string|IAccount>
}

// you can edit this schema!
const accountSchema = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type:String, required: true },

    // you can add additional properties to the schema here:
}, {collection: 'Accounts'});


// logging in/registering stuff
accountSchema.statics.register = function accountRegister(username:string, password:string):Promise<string|IAccount> {
    // Promises: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
    // TL;DR: you can use .then() and .catch() to handle the result of the register
    
    /* for example:

        Account.register('steve', '1234').then(function() {
            trace('success!');
        }).catch(function() {
            trace('fail!');
        })
    
    */
    return new Promise(async (resolve, reject) => {
        var account = new Account({
            username: username,
            password: await hash_password(password),

            // add more stuff below that is defined in the Account Schema above
        })

        account.save(function(err) {
            if (err) {
                trace('Error while registering: ' + err.message);
                reject('failed to register');
            }
            else {
                resolve(account);
            }
        })
    })
}

accountSchema.statics.login = function accountLogin(username:string, password:string):Promise<string|IAccount> {
    return new Promise(async (resolve, reject) => {
        Account.findOne({username: username}, async (err:Error, account:IAccount) => {
            if (!account) {
                reject('account not found');
            }
            else if (err) {
                trace(err);
                reject('error while logging in');
            }
            else {
                if (await verify_password(password, account.password)) {
                    resolve(account);
                }
                else {
                    reject('wrong password');
                }
            }
        })
    })
}

// export const Account:IAccountModel = model<IAccount, IAccountModel>('Account', accountSchema);
export const Account:IAccountModel = model('Account', accountSchema);


export default Account;