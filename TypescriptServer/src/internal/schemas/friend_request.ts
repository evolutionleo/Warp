import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const mongoose = require('mongoose');

import { Model, Document, ObjectId } from 'mongoose';
const { Schema, model } = mongoose;
import { Account, IAccount } from '#schemas/account';
import Profile, { IProfile } from '#schemas/profile';

export interface IFriendRequest extends Document {
    sender_id: ObjectId;
    receiver_id: ObjectId;
}

export interface IFriendRequestModel extends Model<IFriendRequest> {
    findIncoming(profile_id:string):Promise<IProfile[]>;
    findOutgoing(profile_id:string):Promise<IProfile[]>;
    findRequestId(sender_id:string, receiver_id:string):Promise<ObjectId>;
    requestExists(sender_id:string, receiver_id:string):Promise<boolean>;
    accept(req_id:ObjectId|string):Promise<void>;
    reject(req_id:ObjectId|string):Promise<void>;
    cancel(req_id:ObjectId|string):Promise<void>;
}

const friendRequestSchema = new Schema({
    sender_id: { type: Schema.Types.ObjectId, ref: 'Profile' },
    receiver_id: { type: Schema.Types.ObjectId, ref: 'Profile' }
}, {collection: 'FriendRequests'});

friendRequestSchema.statics.findAllIncoming = async function(profile_id:string):Promise<IProfile[]> {
    return await FriendRequest.find({ receiver: profile_id }).populate('sender');
}

friendRequestSchema.statics.findAllOutgoing = async function(profile_id:string):Promise<IProfile[]> {
    return await FriendRequest.find({ sender: profile_id }).populate('sender');
}

friendRequestSchema.statics.findRequestId = async function(sender_id:string, receiver_id:string):Promise<IFriendRequest> {
    return (await FriendRequest.exists({ sender_id, receiver_id }))._id;
}

friendRequestSchema.statics.requestExists = async function(sender_id:string, receiver_id:string):Promise<boolean> {
    return !!await FriendRequest.exists({ sender_id, receiver_id });
}

friendRequestSchema.statics.accept = async function(_id:ObjectId|string):Promise<void> {
    let req:IFriendRequest = await FriendRequest.findById(_id);
    await Profile.findByIdAndUpdate(req.sender_id, { $push: { friends: req.receiver_id } });
    await Profile.findByIdAndUpdate(req.receiver_id, { $push: { friends: req.sender_id  } });
    await req.deleteOne();
}

friendRequestSchema.statics.reject = async function(req_id:ObjectId|string):Promise<void> {
    await FriendRequest.findByIdAndDelete(req_id);
}

friendRequestSchema.statics.cancel = async function(req_id:ObjectId|string):Promise<void> {
    await FriendRequest.findByIdAndDelete(req_id);
}

export const FriendRequest:IFriendRequestModel = new model('FriendRequest', friendRequestSchema);
export default FriendRequest;