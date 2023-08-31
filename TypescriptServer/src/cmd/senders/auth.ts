import SendStuff from "#cmd/sendStuff"
import { getAccountInfo } from "#schemas/account";
import { getProfileInfo } from "#schemas/profile";


declare module "#cmd/sendStuff" {
    interface SendStuff {
        sendName()
        sendRegister(status:string, reason?:string)
        sendLogin(status:string, reason?:string)
    }
}

SendStuff.prototype.sendName = function() {
    this.send({ cmd: 'name set', name: this.name });
}

/**
 * @param {string} status
 * @param {string} [reason='']
 */
SendStuff.prototype.sendRegister = function(status:string, reason:string = ''):void {
    this.send({ cmd: 'register', status, reason });
}

/**
 * @param {string} status 
 * @param {string} [reason=''] 
 */
SendStuff.prototype.sendLogin = function(status:string, reason:string = ''):void {
    this.send({ cmd: 'login', status, reason, account: getAccountInfo(this.account), profile: getProfileInfo(this.profile) });
}