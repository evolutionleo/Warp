import addHandler from "#cmd/handlePacket";

// data.req is checked in the validator
addHandler('match find', (c, data) => {
    if (!global.config.matchmaking_enabled)
        c.sendMatchDenied('matchmaking is disabled');
    
    let req = data.req;
    
    let res = c.matchMakingStart(req);
    if (typeof res === 'string') {
        c.sendMatchDenied(res);
    }
    else {
        c.sendMatchFinding(res);
    }
});

addHandler('match stop', (c, data) => {
    c.matchMakingStop();
});
