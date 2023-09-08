// This schema is for profiles
import mongoose from 'mongoose';
const { model, Schema } = mongoose;

// this holds the state of the profile
// you can edit this schema!
const profileSchema = new Schema({
    account_id: { type: Schema.Types.ObjectId, ref: 'Account' },
    name: { type: String, unique: true },
    
    online: { type: Boolean, default: false },
    last_online: { type: Date, default: Date.now },
    
    friends: [{ type: Schema.Types.ObjectId, ref: 'Profile' }],
    mmr: { type: Number, required: false },
    
    
    state: {
        lobbyid: String,
        room: String,
        
        x: Number,
        y: Number,
        
        //hp: Number
    }
    
    // you can add additional properties to the schema here:
}, { collection: 'Profiles' });


export const Profile = model('Profile', profileSchema);

export default Profile;
export function freshProfile(account) {
    return new Profile({
        account_id: account._id,
        name: account.username,
        mmr: global.config.matchmaking.mmr_starting,
        
        state: {
            lobbyid: '',
            room: '',
            
            x: 0,
            y: 0
        }
    });
}

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
