import SendStuff from "#cmd/sendStuff";
import { getAccountInfo } from "#schemas/account";
import { getProfileInfo } from "#schemas/profile";

/**
 * @param {string} status
 * @param {string} [reason='']
 */
SendStuff.prototype.sendRegister = function (status, reason = '') {
    this.send({ cmd: 'register', status: status, reason: reason });
};

/**
 * @param {string} status
 * @param {string} [reason='']
 */
SendStuff.prototype.sendLogin = function (status, reason = '') {
    this.send({ cmd: 'login', status, reason, account: getAccountInfo(this.account), profile: getProfileInfo(this.profile) });
};
