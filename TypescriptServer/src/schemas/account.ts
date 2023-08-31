// this section contains a schema for saving players' account info
import trace from '#util/logging';

import mongoose, { ObjectId, Document, Model } from 'mongoose';
const { model, Schema }  = mongoose;
import { hashPassword, verifyPassword } from '#util/password_encryption';
import { Names } from '#util/names';


export interface IAccount extends Document {
    username: string,
    password: string
}

export interface IAccountModel extends Model<IAccount> {
    login: (username:string, password:string) => Promise<string|IAccount>,
    register: (username:string, password:string) => Promise<string|IAccount>
}

// you can edit this schema!
const accountSchema = new Schema<IAccount>({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    // you can add additional properties to the schema here:
}, {collection: 'Accounts'});


// logging in/registering stuff
accountSchema.statics.register = function accountRegister(username:string, password:string):Promise<string|IAccount> {
    username = username.toLowerCase();

    return new Promise(async (resolve, reject) => {
        if (!Names.isValid(username)) {
            reject('failed to register');
        }

        var account = new Account({
            username: username,
            password: await hashPassword(password),

            // you can add more stuff below (you'll also need to define it in the Account Schema above)
        })

        account.save()
            .then((acc) => {
                resolve(acc);
            })
            .catch((err) => {
                trace('Error while registering: ' + err.message);
                reject('failed to register');
            });
    })
}

accountSchema.statics.login = function accountLogin(username:string, password:string):Promise<string|IAccount> {
    username = username.toLowerCase();

    return new Promise(async (resolve, reject) => {
        Account.findOne({username: username}).catch((err:Error) => {
            if (err) {
                trace(err);
                reject('error while logging in');
            }
        }).then(async (account:IAccount|void) => {
            if (!account) {
                reject('account not found');
            }
            else {
                if (await verifyPassword(password, account.password)) {
                    resolve(account);
                }
                else {
                    reject('wrong password');
                }
            }
        })
    })
}

export const Account:IAccountModel = model<IAccount, IAccountModel>('Account', accountSchema);
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