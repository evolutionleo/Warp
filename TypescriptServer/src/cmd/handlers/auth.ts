import { addHandler } from "#cmd/handlePacket";
import { Account, getAccountInfo, IAccount } from "#schemas/account";
import Session from "#schemas/session";
import { accountCreate, accountLogin, accountRegister, sessionCreate, sessionGet, sessionLogin } from "#util/auth";
import trace from "#util/logging";
import { Names } from "#util/names";

addHandler('name get', (c) => {
    c.sendName();
});

// create a brand new (temporary) account

addHandler('session create', async (c, data) => {
    let name = c.name; // default name

    try {
        c.account = accountCreate(name, '', true);
        c.session = sessionCreate(c.account);

        await c.register(c.account);

        c.send({ cmd: 'session create', success: true, session: c.session.token });
        c.sendLogin(true);
    }
    catch (reason) {
        c.send({ cmd: 'session create', success: false, reason: reason.toString() });
    }
});

addHandler('session login', async (c, data) => {
    let token = data.session;
    trace('session token login: ' + token);
    
    try {
        c.session = await sessionGet(token);
        c.account = await sessionLogin(c.session);

        await c.login(c.account);
        c.send({ cmd: 'session login', success: true, session: c.session.token });
        c.sendLogin(true);
    }
    catch(reason) {
        trace('error: ' + reason.toString());
        c.send({ cmd: 'session login', success: false, reason: reason.toString() });
    }
});


addHandler('login', (c, data) => {
    let { username, password } = data;
    username = username.toLowerCase();

    accountLogin(username, password)
        .then((account:IAccount) => {
            // this also sends the message
            c.login(account);
            c.sendLogin(true);
        })
        .catch((reason) => {
            c.sendLogin(false, reason);
        });
});

addHandler('register', (c, data) => {
    let { username, password } = data;
    username = username.toLowerCase();

    accountRegister(username, password)
        .then((account:IAccount) => {
            c.register(account);
            c.sendRegister(true);
        })
        .catch((reason) => {
            c.sendRegister(false, reason);
        });
});

// addHandler('logout', (c, data) => {
//     if (!(c.lobby === null && c.ticket === null && c.match === null && c.room === null)) return;

//     c.profile = null;
//     c.account = null;
// });