// This schema is for profiles
import { model, Schema, Document, ObjectId, Model } from 'mongoose';

export interface IProfile extends Document {
    account_id: ObjectId,
    name: string,

    online: boolean,
    last_online: Date,

    friends: ObjectId[],
    chats: ObjectId[],

    mmr: number,

    state: {
        lobby_id: string,
        room: string, // room/level name
        x: number,
        y: number,
        state: number // state.state
    }
}

// this holds the state of the profile
// you can edit this schema!
const profileSchema = new Schema<IProfile>({
    account_id: { type: Schema.Types.ObjectId, ref: 'Account', index: true },
    name: { type: String, unique: true, index: true },

    online: { type: Boolean, default: false },
    last_online: { type: Date, default: Date.now },

    friends: [{ type: Schema.Types.ObjectId, ref: 'Profile' }],
    chats: [{ type: Schema.Types.ObjectId, ref: 'Chat' }],
    mmr: { type: Number, required: false }, // matchmaking rating


    state: {
        lobby_id: { type: String, required: false },
        room: { type: String, required: false },
    
        x: Number,
        y: Number,

        state: Number
    }

    // you can add additional properties to the schema here:
});


export const Profile:Model<IProfile> = model<IProfile>('Profile', profileSchema, 'Profiles');
export default Profile;



export type ProfileInfo = {
    id: string,
    name: string,

    online: boolean,
    last_online: string,

    mmr: number
}

// like profile, but only the data that is useful for sending
export function getProfileInfo(p: IProfile):ProfileInfo {
    if (p === null) return null;

    return {
        id: p.id,
        name: p.name,
        online: p.online,
        last_online: p.last_online.toISOString(),
        mmr: p.mmr
    };
}