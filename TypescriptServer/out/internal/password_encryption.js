import * as crypto from 'crypto'; // encrypt our passwords!
// complicated stuff, don't worry about this too much
export function hash_password(password) {
    return new Promise((resolve, reject) => {
        const salt = crypto.randomBytes(8).toString('hex');
        crypto.scrypt(password, salt, 16, (err, derivedKey) => {
            if (err)
                reject(err);
            resolve(salt + ":" + derivedKey.toString('hex'));
        });
    });
}
export function verify_password(password, _hash) {
    return new Promise((resolve, reject) => {
        const [salt, hash] = _hash.split(':');
        const hashBuffer = Buffer.from(hash, 'hex');
        crypto.scrypt(password, salt, 16, (err, derivedKey) => {
            if (err)
                reject(err);
            resolve(crypto.timingSafeEqual(hashBuffer, derivedKey));
        });
    });
}
