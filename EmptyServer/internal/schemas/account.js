// this section contains a schema for saving players' account info
const mongoose = require('mongoose'); // MongoDB driver
const { hash_password, verify_password } = require('../password_encryption.js'); // gotta encrypt out passwords!
const Profile = require('./profile.js');

// you can edit this schema!
const accountSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: String

    // you can add additional properties to the schema here:
}, {collection: 'Accounts'});


// logging in/registering stuff
accountSchema.statics.register = function(username, password) {
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

            // add more stuff below that is defined in the Account Schema above
        })

        account.save(function(err) {
            if (err) {
                console.log('Error while registering: ' + err.message);
                reject('failed to register');
            }
            else {
                resolve(account);
            }
        })
    })
}

accountSchema.statics.login = function(username, password) {
    return new Promise(async (resolve, reject) => {
        Account.findOne({username: username}, async (err, account) => {
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
        })
    })
}

const Account = mongoose.model('Account', accountSchema);

module.exports = Account;