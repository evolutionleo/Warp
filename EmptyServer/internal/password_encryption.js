const crypto = require('crypto'); // encrypt our passwords!


// complicated stuff, don't worry about this too much
module.exports.hash_password = function hash_password(password) {
    return new Promise((resolve, reject) => {
        const salt = crypto.randomBytes(8).toString('hex');
        crypto.scrypt(password, salt, 16, (err, derivedKey) => {
            if (err) reject(err);
            resolve(salt + ":" + derivedKey.toString('hex'));
        })
    })
}

module.exports.verify_password = function verify_password(password, _hash) {
    return new Promise((resolve, reject) => {
        const [salt, hash] = _hash.split(':');
        const hashBuffer = Buffer.from(hash, 'hex');
        crypto.scrypt(password, salt, 16, (err, derivedKey) => {
            if (err) reject(err);
            resolve( crypto.timingSafeEqual(hashBuffer, derivedKey) );
        })
    })
}
