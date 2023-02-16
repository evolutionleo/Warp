import * as crypto from 'crypto';


export async function hash_password(password:string):Promise<string> {
    return new Promise((resolve, reject) => {
        const salt = crypto.randomBytes(16).toString('hex');
        crypto.scrypt(password, salt, 64, (err, derivedKey) => {
            if (err) reject(err);
            resolve(salt + ":" + derivedKey.toString('hex'));
        });
    });
}

export async function verify_password(password:string, _hash:string):Promise<boolean|Error> {
    return new Promise((resolve, reject) => {
        const [salt, hash] = _hash.split(':');
        const hashBuffer = Buffer.from(hash, 'hex');
        
        const keyLength = salt.length == 16 ? 16 : 64; // legacy passwords with salt length 8 & key length 16
        crypto.scrypt(password, salt, keyLength, (err, derivedKey) => {
            if (err) reject(err);
            resolve( crypto.timingSafeEqual(hashBuffer, derivedKey) );
        });
    });
}
