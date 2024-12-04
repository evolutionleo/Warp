import { addHandler } from "#cmd/handlePacket";
import { partyExists } from "#matchmaking/party";

addHandler('party join', (c, data) => {
    let party_id = data.party_id;
    if (partyExists(party_id))
        c.partyJoin(party_id);
});

addHandler('party leave', (c) => {
    if (!c.party)
        return;
    c.partyLeave();
});

addHandler('party kick', (c, data) => {
    if (!c.party)
        return;
    if (!c.party.isLeader(c))
        return;
    
    let { profile_id, username } = data;
    let reason = data.reason ?? '';
    let member = null;
    
    if (profile_id) {
        member = global.clients.find(u => u.profile.id === profile_id);
    }
    else {
        member = global.clients.find(u => u.name === username);
    }
    
    if (member && c !== member && c.party.isMember(member)) {
        c.party.kickMember(member, reason, true);
    }
});

addHandler('party disband', (c) => {
    if (!c.party)
        return;
    if (!c.party.isLeader(c))
        return;
    
    c.party.disband();
});

addHandler('party invite', (c, data) => {
    let { profile_id, username } = data;
    let user = null;
    
    if (profile_id) {
        user = global.clients.find(u => u.profile.id === profile_id);
    }
    else {
        user = global.clients.find(u => u.name === username);
    }
    
    if (user && c != user)
        c.partyInvite(user);
    else {
        // user not found
    }
});
