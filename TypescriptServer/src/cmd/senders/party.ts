import SendStuff from "#cmd/sendStuff"
import Party from "#concepts/party"

declare module '#cmd/sendStuff' {
    interface SendStuff {
        sendPartyInvite(party:Party)
        sendPartyLeave(party:Party, reason:string, forced:boolean)
        sendPartyJoin(party:Party)
        sendPartyReject(party?:Party, reason?:string)
        sendPartyInviteSent()
    }
}

SendStuff.prototype.sendPartyInvite = function(party:Party) {
    this.send({ cmd: 'party invite', party: party.getInfo() });
}

SendStuff.prototype.sendPartyLeave = function(party:Party, reason:string, forced:boolean) {
    this.send({ cmd: 'party leave', party: party.getInfo(), forced, reason });
}

SendStuff.prototype.sendPartyJoin = function(party:Party) {
    this.send({ cmd: 'party join', party: party.getInfo() });
}

SendStuff.prototype.sendPartyReject = function(party?:Party, reason:string = 'Unable to join party') {
    this.send({ cmd: 'party reject', party: party?.getInfo(), reason });
}

SendStuff.prototype.sendPartyInviteSent = function() {
    this.send({ cmd: 'party invite sent' });
}