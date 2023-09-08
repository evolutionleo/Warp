import SendStuff from "#cmd/sendStuff"
import Party from "#matchmaking/party"

declare module '#cmd/sendStuff' {
    interface SendStuff {
        sendPartyInvite(party:Party)
        sendPartyLeave(party:Party, reason:string, forced:boolean)
        sendPartyJoin(party:Party)
        sendPartyReject(party?:Party, reason?:string)
        sendPartyInviteSent(username: string)
        sendPartyInfo(party:Party)
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

// Cannot join a party for some reason
SendStuff.prototype.sendPartyReject = function(party?:Party, reason:string = 'Unable to join the party') {
    this.send({ cmd: 'party reject', party: party?.getInfo(), reason });
}

SendStuff.prototype.sendPartyInviteSent = function(username) {
    this.send({ cmd: 'party invite sent', to: username });
}

SendStuff.prototype.sendPartyInfo = function(party:Party) {
    this.send({ cmd: 'party info', party: party.getInfo() });
}