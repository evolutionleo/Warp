import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const mongoose = require('mongoose');

import { Model, Document, ObjectId } from 'mongoose';
const { Schema, model } = mongoose;
import { Account, IAccount } from '#schemas/account';
import Profile, { IProfile } from '#schemas/profile';

export interface IFriendRequest extends Document {
    sender: ObjectId;
    receiver: ObjectId;
}

export interface IFriendRequestModel extends Model<IFriendRequest> {
    findIncoming(profile_id:string):Promise<IProfile[]>;
    findOutgoing(profile_id:string):Promise<IProfile[]>;
    findRequestId(sender:string, receiver:string):Promise<ObjectId>;
    requestExists(sender:string, receiver:string):Promise<boolean>;
    accept(req_id:ObjectId|string):Promise<void>;
    reject(req_id:ObjectId|string):Promise<void>;
    cancel(req_id:ObjectId|string):Promise<void>;
}

const friendRequestSchema = new Schema({
    sender: { type: Schema.Types.ObjectId, ref: 'Profile' },
    receiver: { type: Schema.Types.ObjectId, ref: 'Profile' }
}, {collection: 'FriendRequests'});

friendRequestSchema.statics.findIncoming = async function(profile_id:string):Promise<IProfile[]> {
    return await (await FriendRequest.find({ receiver: profile_id }).populate<{ sender: IProfile }>('sender')).map(req => req.sender);
}

friendRequestSchema.statics.findOutgoing = async function(profile_id:string):Promise<IProfile[]> {
    return (await FriendRequest.find({ sender: profile_id }).populate<{ receiver: IProfile }>('receiver')).map(req => req.receiver);
}

friendRequestSchema.statics.findRequestId = async function(sender:string, receiver:string):Promise<IFriendRequest> {
    return (await FriendRequest.exists({ sender, receiver }))._id;
}

friendRequestSchema.statics.requestExists = async function(sender:string, receiver:string):Promise<boolean> {
    return !!await FriendRequest.exists({ sender, receiver });
}

friendRequestSchema.statics.accept = async function(_id:ObjectId|string):Promise<void> {
    let req:IFriendRequest = await FriendRequest.findById(_id);
    await Profile.findByIdAndUpdate(req.sender, { $push: { friends: req.receiver } });
    await Profile.findByIdAndUpdate(req.receiver, { $push: { friends: req.sender  } });
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