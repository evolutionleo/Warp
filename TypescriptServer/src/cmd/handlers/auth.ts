import { addHandler } from "#cmd/handlePacket";
import { Account, getAccountInfo, IAccount } from "#schemas/account";
import Session from "#schemas/session";
import { accountActivate, accountCreate, accountLogin, accountRegister, profileRename, sessionCreate, sessionGet, sessionLogin } from "#util/auth";
import trace from "#util/logging";
import { Names } from "#util/names";

addHandler('name get', (c) => {
    c.sendName();
});

addHandler('name set', async (c, data) => {
    let name = data.name;

    if (c.logged_in) {
        try {
            await profileRename(c.profile, name);
            c.sendName();
        }
        catch(e) {}
    }
    else {
        if (!Names.isValid(name)) {
            return;
        }
        if (global.clients.some(client => client.name === name)) {
            return;
        }

        c.name = name;
        c.sendName();
    }
});

// create a brand new (temporary) account

addHandler('session create', async (c, data) => {
    let name = c.name; // default name

    try {
        c.account = accountCreate(name, '', true);
        c.session = sessionCreate(c.account);

        await c.register(c.account);

        c.sendSessionCreate(true, '', c.session.token);
        c.sendLogin(true);
    }
    catch (reason) {
        c.sendSessionCreate(false, reason.toString());
    }
});

addHandler('session login', async (c, data) => {
    let token = data.session;
    
    try {
        c.session = await sessionGet(token);
        c.account = await sessionLogin(c.session);

        await c.login(c.account);
        c.sendSession(true);
        c.sendLogin(true);

        // another client logged into the same session?
        let old_client = global.clients.find((client) => client !== c && client.session?.token === c.session?.token);
        
        if (old_client !== undefined) {
            if (old_client.connected) {
                old_client.disconnect();
            }
            
            old_client.reconnect(c);
        }
    }
    catch(reason) {
        trace('error: ' + reason.toString());
        c.sendSession(false, reason);
        // c.send({ cmd: 'session login', success: false, reason: reason.toString() });
    }
});


addHandler('login', (c, data) => {
    let { username, password } = data;
    username = username.toLowerCase();

    accountLogin(username, password)
        .then((account:IAccount) => {
            c.login(account);
            c.session = sessionCreate(account);

            c.sendLogin(true);
            c.sendSession(true);
        })
        .catch((reason) => {
            c.sendLogin(false, reason);
        });
});

addHandler('register', (c, data) => {
    let { username, password } = data;
    username = username.toLowerCase();

    let promise: Promise<IAccount>;

    if (c.session && c.account && c.account.temporary) {
        promise = accountActivate(c.account, username, password);
    }
    else {
        promise = accountRegister(username, password);
    }

    promise
        .then((account:IAccount) => {
            c.register(account);
            c.session = sessionCreate(c.account);

            c.sendRegister(true);
            c.sendLogin(true);
            c.sendSession(true);
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