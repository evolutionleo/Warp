// This schema is for profiles. The idea is that
// multiple profiles can be linked to the same account
const mongoose = require('mongoose');
const Account = require('./account.js');

// this holds the state of the profile
// you can edit this schema!
const profileSchema = new mongoose.Schema({
    account_id: { type: mongoose.Schema.Types.ObjectId },
    name: String,

    lobbyid: Number,

    x: Number,
    y: Number

    // you can add additional properties to the schema here:
    // hp: Number,
}, {collection: 'Profiles'});


const Profile = mongoose.model('Profile', profileSchema);

module.exports.Profile = Profile;
module.exports.freshProfile = function(account) { // for when just registered
    return new Profile({
        account_id: account._id,
        name: account.username,

        lobbyid: -1,

        x: 0,
        y: 0
    });
}