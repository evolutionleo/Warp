import SendStuff from "#cmd/sendStuff"
import { getAccountInfo } from "#schemas/account";
import { getProfileInfo } from "#schemas/profile";


declare module "#cmd/sendStuff" {
    interface SendStuff {
        sendName()
        sendRegister(success:boolean, reason?:string)
        sendLogin(success:boolean, reason?:string)
        sendSession(success:boolean, reason?:string, session_token?:string)
    }
}

SendStuff.prototype.sendName = function() {
    this.send({ cmd: 'name set', name: this.name });
}

/**
 * @param {string} success
 * @param {string} [reason='']
 */
SendStuff.prototype.sendRegister = function(success:boolean, reason:string = ''):void {
    this.send({ cmd: 'register', success, reason });
}

/**
 * @param {string} success 
 * @param {string} [reason=''] 
 */
SendStuff.prototype.sendLogin = function(success:boolean, reason:string = ''):void {
    this.send({ cmd: 'login', success, reason, account: getAccountInfo(this.account), profile: getProfileInfo(this.profile) });
}

SendStuff.prototype.sendSession = function(success, reason:string = '', token = undefined) {
    if (token === undefined && success) {
        token = this.session.token;
    }
    this.send({ cmd: 'session login', success, reason, session: token });
}