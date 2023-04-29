import { addHandler } from "#cmd/handlePacket";
import { partyExists } from "#concepts/party";

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

addHandler('party disband', (c) => {
    if (!c.party)
        return;
    if (!c.party.isLeader(c))
        return;
    
    c.party.disband();
});

addHandler('party invite', (c, data) => {
    var profileid = data.profileid;
    var user = global.clients.find(u => u.profile.id === profileid);
    
    if (user)
        c.partyInvite(user);
});
