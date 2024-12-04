import SendStuff from "#cmd/sendStuff";
import { getAccountInfo } from "#schemas/account";
import { getProfileInfo } from "#schemas/profile";

SendStuff.prototype.sendName = function () {
    this.send({ cmd: 'name set', name: this.name });
};

/**
 * @param {string} success
 * @param {string} [reason='']
 */
SendStuff.prototype.sendRegister = function (success, reason = '') {
    this.send({ cmd: 'register', success, reason });
};

/**
 * @param {string} success
 * @param {string} [reason='']
 */
SendStuff.prototype.sendLogin = function (success, reason = '') {
    this.send({ cmd: 'login', success, reason, account: getAccountInfo(this.account), profile: getProfileInfo(this.profile) });
};

SendStuff.prototype.sendSession = function (success, reason = '', token = undefined) {
    if (token === undefined && success) {
        token = this.session.token;
    }
    this.send({ cmd: 'session login', success, reason, session: token });
};

SendStuff.prototype.sendSessionCreate = function (success, reason = '', token = undefined) {
    if (token === undefined && success) {
        token = this.session.token;
    }
    this.send({ cmd: 'session create', success: true, reason, session: token });
};
