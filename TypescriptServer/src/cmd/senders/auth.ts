import SendStuff from "#cmd/sendStuff"
import { getAccountInfo } from "#schemas/account";
import { getProfileInfo } from "#schemas/profile";


declare module "#cmd/sendStuff" {
    interface SendStuff {
        sendRegister(status:string, reason?:string)
        sendLogin(status:string, reason?:string)
    }
}

/**
 * @param {string} status
 * @param {string} [reason='']
 */
SendStuff.prototype.sendRegister = function(status:string, reason:string = ''):void {
    this.send({cmd: 'register', status: status, reason: reason});
}

/**
 * @param {string} status 
 * @param {string} [reason=''] 
 */
SendStuff.prototype.sendLogin = function(status:string, reason:string = ''):void {
    this.send({cmd: 'login', status, reason, account: getAccountInfo(this.account), profile: getProfileInfo(this.profile)});
}