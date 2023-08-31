import addHandler from "#cmd/handlePacket";

// data.req is checked in the validator
addHandler('match find', (c, data) => {
    let req = data.req;
    c.matchMakingStart(req);
});

addHandler('match stop', (c, data) => {
    c.matchMakingStop();
});