import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const mongoose = require('mongoose');

import { Model, Document, ObjectId } from 'mongoose';
const { Schema, model } = mongoose;
import { Account, IAccount } from '#schemas/account';

export interface IFriendRequest extends Document {
    from_id: ObjectId;
    to_id: ObjectId;
}

const friendRequestSchema = new Schema({
    from_id: { type: Schema.Types.ObjectId, ref: 'Account' },
    to_id: { type: Schema.Types.ObjectId, ref: 'Account' }
}, {collection: 'FriendRequests'});


export const FriendRequest:IFriendRequest = new model('FriendRequest', friendRequestSchema);

export default FriendRequest;