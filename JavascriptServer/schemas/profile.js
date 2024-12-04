// This schema is for profiles
import { model, Schema } from 'mongoose';

// this holds the state of the profile
// you can edit this schema!
const profileSchema = new Schema({
    account_id: { type: Schema.Types.ObjectId, ref: 'Account', index: true },
    name: { type: String, unique: true, index: true },
    
    online: { type: Boolean, default: false },
    last_online: { type: Date, default: Date.now },
    
    friends: [{ type: Schema.Types.ObjectId, ref: 'Profile' }],
    chats: [{ type: String, ref: 'Chat' }], // chat ids are strings
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


export const Profile = model('Profile', profileSchema, 'Profiles');
export default Profile;

// like profile, but only the data that is useful for sending
export function getProfileInfo(p) {
    if (p === null)
        return null;
    
    return {
        id: p.id,
        name: p.name,
        online: p.online,
        last_online: p.last_online.toISOString(),
        mmr: p.mmr
    };
}
