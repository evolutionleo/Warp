function sendPartyInvite(uname = "", profile_id = "") {
	send({ cmd: "party invite", profile_id, uname })
}

function sendPartyLeave() {
	send({ cmd: "party leave" })
}

function sendPartyDisband() {
	send({ cmd: "party disband" })
}

function sendPartyJoin(party_id) {
	send({ cmd: "party join",  party_id })
}