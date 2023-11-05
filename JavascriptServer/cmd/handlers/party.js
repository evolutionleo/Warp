import { addHandler } from "#cmd/handlePacket";
import { partyExists } from "#matchmaking/party";

addHandler('party join', (c, data) => {
    var partyid = data.partyid;
    if (partyExists(partyid))
        c.partyJoin(partyid);
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
    
    let { profileid, username } = data;
    let reason = data.reason ?? '';
    let member = null;
    
    if (profileid) {
        member = global.clients.find(u => u.profile.id === profileid);
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
    let { profileid, username } = data;
    let user = null;
    
    if (profileid) {
        user = global.clients.find(u => u.profile.id === profileid);
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
