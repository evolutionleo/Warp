function sendPartyInvite(uname = "", profileid = "") {
	send({ cmd: "party invite", profileid, uname })
}

function sendPartyLeave() {
	send({ cmd: "party leave" })
}

function sendPartyDisband() {
	send({ cmd: "party disband" })
}

function sendPartyJoin(partyid) {
	send({ cmd: "party join",  partyid })
}