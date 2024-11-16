import Account, { AccountInfo, IAccount } from '#schemas/account';
import Profile, { IProfile, ProfileInfo } from '#schemas/profile';
import * as crypto from 'crypto';
import { Names } from '#util/names';
import trace from '#util/logging';
import Session, { ISession } from '#schemas/session';


// these can be slow and should ideally only be called from async functions
export function hashPassword(password:string):string {
    const salt = crypto.randomBytes(16).toString('hex');
    const derivedKey = crypto.scryptSync(password, salt, 64);
    const result = salt + ":" + derivedKey.toString('hex');

    return result;
}

export function verifyPassword(password:string, _hash:string):boolean {
    const [salt, hash] = _hash.split(':');
    const hashBuffer = Buffer.from(hash, 'hex');
    
    const keyLength = salt.length == 16 ? 16 : 64; // legacy passwords with salt length 8 & key length 16
    const derivedKey = crypto.scryptSync(password, salt, keyLength);

    return crypto.timingSafeEqual(hashBuffer, derivedKey);
}



export function sessionCreate(account:IAccount):ISession {
    const token = crypto.randomBytes(16).toString('hex')

    return new Session({
        account_id: account.id,
        token: token
    });
}

export function profileCreate(account:IAccount):IProfile { // for when just registered
    return new Profile({
        account_id: account.id,
        name: account.username,
        mmr: global.config.matchmaking.mmr_starting,

        state: {
            lobbyid: null,
            room: null,
    
            x: 0,
            y: 0,

            state: 0
        }
    });
}

export function accountCreate(username: string, password = '', temporary = true):IAccount {
    if (!temporary) {
        password = hashPassword(password);
    }
    else {
        password = '';
    }

    return new Account({
        username,
        password,
        temporary
    
        // you can add more stuff below (you'll also need to define it in the Account Schema above)
    });
}


export async function getProfileByName(name: string):Promise<IProfile> {
    return await Profile.findOne({ name });
}



// logging in/registering stuff
export async function accountRegister(username:string, password:string):Promise<IAccount> {
        if (!Names.isValid(username)) {
            throw 'invalid username';
        }
        if (await Account.exists({ username })) {
            throw 'username already taken';
        }

        const account = accountCreate(username, password, false);
        return await account.save();
}

export async function accountActivate(account:IAccount, new_username: string, password: string):Promise<IAccount> {
    if (!account.temporary) {
        throw 'account not temporary';
    }
    if (!Names.isValid(new_username)) {
        throw 'invalid username';
    }
    if (await Account.exists({ username: new_username })) {
        throw 'username taken';
    }

    account.username = new_username;
    account.password = password;
    account.temporary = false;

    await account.save();

    return account;
}

export async function accountLogin(username:string, password:string):Promise<IAccount> {
    const account = await Account.findOne({ username });
    if (!account) {
        throw 'account not found';
    }
    if (account.temporary) {
        throw 'account is not activated';
    }
    if (!verifyPassword(password, account.password)) {
        throw 'wrong password';
    }

    return account;
}

export async function sessionGet(session_token: string):Promise<ISession> {
    const session = await Session.findOne({ token: session_token });
    if (!session) {
        throw 'session does not exist';
    }

    return session;
}

export async function sessionLogin(session: ISession):Promise<IAccount> {
    const account = await Account.findOne({ id: session.account_id });
    if (!account) {
        throw 'account does not exist';
    }

    return account;
}