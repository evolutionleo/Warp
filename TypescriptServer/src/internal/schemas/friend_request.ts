import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const mongoose = require('mongoose');

import { Model, Document, ObjectId } from 'mongoose';
const { Schema, model } = mongoose;
import { Account, IAccount } from '#schemas/account';
import Profile from './profile';

export interface IFriendRequest extends Document {
    sender_id: ObjectId;
    receiver_id: ObjectId;
}

export interface IFriendRequestModel extends Model<IFriendRequest> {
    findIncoming(profile_id:string):IAccount;
    findOutgoing(profile_id:string):IAccount;
    requestExists(from_id:string, to_id:string):Promise<boolean>;
    accept(_id:string):Promise<void>;
    reject(_id:string):Promise<void>;
}

const friendRequestSchema = new Schema({
    from_id: { type: Schema.Types.ObjectId, ref: 'Profile' },
    to_id: { type: Schema.Types.ObjectId, ref: 'Profile' }
}, {collection: 'FriendRequests'});

friendRequestSchema.statics.findIncoming = function(profile_id:string):IAccount[] {
    return this.find({ receiver: profile_id });
}

friendRequestSchema.statics.findOutgoing = function(profile_id:string):IAccount[] {
    return this.find({ sender: profile_id });
}

friendRequestSchema.statics.requestExists = async function(from_id:string, to_id:string):Promise<boolean> {
    return !!await FriendRequest.exists({ sender: from_id, receiver: to_id });
}

friendRequestSchema.statics.accept = async function(_id:string):Promise<void> {
    let req:IFriendRequest = await this.findById(_id);
    Profile.findByIdAndUpdate(req.sender_id, { $push: { friends: req.receiver_id } });
    Profile.findByIdAndUpdate(req.receiver_id, { $push: { friends: req.sender_id  } });
    req.deleteOne();
}

friendRequestSchema.statics.reject = async function(_id:string):Promise<void> {
    await this.findByIdAndDelete(_id);
}

export const FriendRequest:IFriendRequestModel = new model('FriendRequest', friendRequestSchema);

export default FriendRequest;