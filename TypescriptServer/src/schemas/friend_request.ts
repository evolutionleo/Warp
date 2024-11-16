import { model, Schema, Model, Document, ObjectId } from 'mongoose';
import Profile, { IProfile } from '#schemas/profile';

export interface IFriendRequest extends Document {
    sender: ObjectId;
    receiver: ObjectId;
}

type OID = ObjectId|string;

export interface IFriendRequestModel extends Model<IFriendRequest> {
    findIncoming(profile_id:OID):Promise<IProfile[]>;
    findOutgoing(profile_id:OID):Promise<IProfile[]>;
    findRequestId(sender:OID, receiver:OID):Promise<ObjectId>;
    requestExists(sender:OID, receiver:OID):Promise<boolean>;
    accept(req_id:OID):Promise<void>;
    reject(req_id:OID):Promise<void>;
    cancel(req_id:OID):Promise<void>;
}

const friendRequestSchema = new Schema({
    sender: { type: Schema.Types.ObjectId, ref: 'Profile' },
    receiver: { type: Schema.Types.ObjectId, ref: 'Profile' }
}, {collection: 'FriendRequests'});

friendRequestSchema.statics.findIncoming = async function(profile_id:OID):Promise<IProfile[]> {
    return (await FriendRequest.find({ receiver: profile_id }).populate<{ sender: IProfile }>('sender')).map(req => req.sender);
}

friendRequestSchema.statics.findOutgoing = async function(profile_id:OID):Promise<IProfile[]> {
    return (await FriendRequest.find({ sender: profile_id }).populate<{ receiver: IProfile }>('receiver')).map(req => req.receiver);
}

friendRequestSchema.statics.findRequestId = async function(sender:OID, receiver:OID):Promise<ObjectId> {
    return (await FriendRequest.findOne({ sender, receiver })).id;
}

friendRequestSchema.statics.requestExists = async function(sender:OID, receiver:OID):Promise<boolean> {
    return !!await FriendRequest.exists({ sender, receiver });
}

friendRequestSchema.statics.accept = async function(req_id:OID):Promise<void> {
    let req:IFriendRequest = await FriendRequest.findById(req_id);
    await Profile.findByIdAndUpdate(req.sender, { $push: { friends: req.receiver } });
    await Profile.findByIdAndUpdate(req.receiver, { $push: { friends: req.sender } });
    await req.deleteOne();
}

friendRequestSchema.statics.reject = async function(req_id:OID):Promise<void> {
    await FriendRequest.findByIdAndDelete(req_id);
}

friendRequestSchema.statics.cancel = async function(req_id:OID):Promise<void> {
    await FriendRequest.findByIdAndDelete(req_id);
}

export const FriendRequest:IFriendRequestModel = model<IFriendRequest, IFriendRequestModel>('FriendRequest', friendRequestSchema);
export default FriendRequest;