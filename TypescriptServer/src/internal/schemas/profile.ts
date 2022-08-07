// This schema is for profiles. The idea is that
// multiple profiles can be linked to the same account

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const mongoose = require('mongoose');

import { Model, Document } from 'mongoose';
const { Schema, model } = mongoose;

import { Account, IAccount } from '#schemas/account';

export interface IProfile extends Document {
    account_id: string,
    name: string,

    lobbyid: string,
    room: string, // room/map name
    x: number,
    y: number
}

// this holds the state of the profile
// you can edit this schema!
const profileSchema = new Schema({
    account_id: { type: Schema.Types.ObjectId },
    name: {type:String, required: false},

    lobbyid: {type:String, required: false},
    room: {type:String, required: false},

    x: {type:Number, required: false},
    y: {type:Number, required: false}

    // you can add additional properties to the schema here:
    // hp: Number,
}, {collection: 'Profiles'});


export const Profile:Model<IProfile> = model('Profile', profileSchema);

export default Profile;
export function freshProfile(account:IAccount):IProfile { // for when just registered
    return new Profile({
        account_id: account._id,
        name: account.username,

        lobbyid: '-1',
        room: global.config.room.starting_room,

        x: 0,
        y: 0
    });
}