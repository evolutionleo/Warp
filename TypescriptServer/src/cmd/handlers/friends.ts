import addHandler from "#cmd/handlePacket";

addHandler('friend req inc', async (c, data) => {
    let from_profiles = await c.getIncomingFriendRequests();
    c.sendIncomingFriendRequests(from_profiles);
});

addHandler('friend req out', async (c, data) => {
    let to_profiles = await c.getOutgoingFriendRequests();
    c.sendOutgoingFriendRequests(to_profiles);
});

addHandler('friend list', async (c, data) => {
    let friends = await c.getFriends();
    c.sendFriends(friends);
});

addHandler('friend req send', (c, data) => {
    c.friendRequestSend(data.friend);
    c.send({ cmd: 'friend req sent', to: data.friend.name });
});

addHandler('friend req accept', (c, data) => {
    c.friendRequestAccept(data.friend);
    c.send({ cmd: 'friend req accepted', from: data.friend.name });
});

addHandler('friend req reject', (c, data) => {
    c.friendRequestReject(data.friend);
    c.send({ cmd: 'friend req rejected', from: data.friend.name });
});

addHandler('friend req cancel', (c, data) => {
    c.friendRequestCancel(data.friend);
    c.send({ cmd: 'friend req cacnelled' });
});

addHandler('friend add', async (c, data) => {
    c.friendAdd(data.friend);
    c.send({ cmd: 'friend added', name: data.friend.name });
});

addHandler('friend remove', async (c, data) => {
    c.friendRemove(data.friend);
    c.send({ cmd: 'friend removed', name: data.friend.name });
});