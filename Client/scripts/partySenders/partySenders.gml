// invite either via username or via profile_id
function sendPartyInvite(username = "", profile_id = "") {
	send({ cmd: "party invite", profile_id, username })
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