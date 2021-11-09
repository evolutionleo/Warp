// this section contains a schema for saving players' account info
// import { Schema, model } from 'mongoose';
// const { Model, Document } = require('mongoose');
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
// import * as mongoose from 'mongoose';
const mongoose = require('mongoose');
const { Schema, model } = mongoose;
// const mongoose = require('mongoose');
// const Model = mongoose.Model;
// const Schema = mongoose.Schema;
// import * as mongoose from 'mongoose';
// const { Schema, model } = mongoose; // because it doesn't have a named export
// import { Model, Document } from 'mongoose';
import { hash_password, verify_password } from '#util/password_encryption';
// you can edit this schema!
const accountSchema = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
}, { collection: 'Accounts' });
// logging in/registering stuff
accountSchema.statics.register = function (username, password) {
    // Promises: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
    // TL;DR: you can use .then() and .catch() to handle the result of the register
    /* for example:

        Account.register('steve', '1234').then(function() {
            console.log('success!');
        }).catch(function() {
            console.log('fail!');
        })
    
    */
    return new Promise(async (resolve, reject) => {
        var account = new Account({
            username: username,
            password: await hash_password(password),
        });
        account.save(function (err) {
            if (err) {
                console.log('Error while registering: ' + err.message);
                reject('failed to register');
            }
            else {
                resolve(account);
            }
        });
    });
};
accountSchema.statics.login = function (username, password) {
    return new Promise(async (resolve, reject) => {
        Account.findOne({ username: username }, async (err, account) => {
            if (!account) {
                reject('account not found');
            }
            else if (err) {
                console.log(err);
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
        });
    });
};
// export const Account:IAccountModel = model<IAccount, IAccountModel>('Account', accountSchema);
export const Account = model('Account', accountSchema);
export default Account;
