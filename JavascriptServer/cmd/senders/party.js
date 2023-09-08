import SendStuff from "#cmd/sendStuff";

SendStuff.prototype.sendPartyInvite = function (party) {
    this.send({ cmd: 'party invite', party: party.getInfo() });
};

SendStuff.prototype.sendPartyLeave = function (party, reason, forced) {
    this.send({ cmd: 'party leave', party: party.getInfo(), forced, reason });
};

SendStuff.prototype.sendPartyJoin = function (party) {
    this.send({ cmd: 'party join', party: party.getInfo() });
};

// Cannot join a party for some reason
SendStuff.prototype.sendPartyReject = function (party, reason = 'Unable to join the party') {
    this.send({ cmd: 'party reject', party: party?.getInfo(), reason });
};

SendStuff.prototype.sendPartyInviteSent = function (username) {
    this.send({ cmd: 'party invite sent', to: username });
};

SendStuff.prototype.sendPartyInfo = function (party) {
    this.send({ cmd: 'party info', party: party.getInfo() });
};
