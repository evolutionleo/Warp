import { model, Schema } from 'mongoose';
import Profile from '#schemas/profile';

const friendRequestSchema = new Schema({
    sender: { type: Schema.Types.ObjectId, ref: 'Profile' },
    receiver: { type: Schema.Types.ObjectId, ref: 'Profile' }
}, { collection: 'FriendRequests' });

friendRequestSchema.statics.findIncoming = async function (profile_id) {
    return (await FriendRequest.find({ receiver: profile_id }).populate('sender')).map(req => req.sender);
};

friendRequestSchema.statics.findOutgoing = async function (profile_id) {
    return (await FriendRequest.find({ sender: profile_id }).populate('receiver')).map(req => req.receiver);
};

friendRequestSchema.statics.findRequestId = async function (sender, receiver) {
    return (await FriendRequest.findOne({ sender, receiver })).id;
};

friendRequestSchema.statics.requestExists = async function (sender, receiver) {
    return !!await FriendRequest.exists({ sender, receiver });
};

friendRequestSchema.statics.accept = async function (req_id) {
    let req = await FriendRequest.findById(req_id);
    await Profile.findByIdAndUpdate(req.sender, { $push: { friends: req.receiver } });
    await Profile.findByIdAndUpdate(req.receiver, { $push: { friends: req.sender } });
    await req.deleteOne();
};

friendRequestSchema.statics.reject = async function (req_id) {
    await FriendRequest.findByIdAndDelete(req_id);
};

friendRequestSchema.statics.cancel = async function (req_id) {
    await FriendRequest.findByIdAndDelete(req_id);
};

export const FriendRequest = model('FriendRequest', friendRequestSchema);
export default FriendRequest;
