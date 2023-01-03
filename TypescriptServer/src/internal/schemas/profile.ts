// This schema is for profiles

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const mongoose = require('mongoose');

import { Model, Document, ObjectId } from 'mongoose';
const { Schema, model } = mongoose;

import { Account, IAccount } from '#schemas/account';

export interface IProfile extends Document {
    account_id: string,
    name: string,

    online: boolean,
    last_online: Date,

    friends: ObjectId[],
    mmr: number

    state: {
        lobbyid: string,
        room: string, // room/map name
        x: number,
        y: number
    }
}

// this holds the state of the profile
// you can edit this schema!
const profileSchema = new Schema({
    account_id: { type: Schema.Types.ObjectId, ref: 'Account' },
    name: String,

    online: { type: Boolean, default: false },
    last_online: { type: Date, default: Date.now },

    friends: [{ type: Schema.Types.ObjectId, ref: 'Profile' }],
    mmr: { type: Number, required: false }, // matchmaking rating


    state: {
        lobbyid: String,
        room: String,
    
        x: Number,
        y: Number,

        //hp: Number
    }

    // you can add additional properties to the schema here:
}, {collection: 'Profiles'});


export const Profile:Model<IProfile> = model('Profile', profileSchema);

export default Profile;
export function freshProfile(account:IAccount):IProfile { // for when just registered
    return new Profile({
        account_id: account._id,
        name: account.username,

        state: {
            lobbyid: '',
            room: '',
    
            x: 0,
            y: 0
        }
    });
}