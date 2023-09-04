function sendLobbyJoin(lobbyid) {
	send({cmd: "lobby join", lobbyid: lobbyid})
}

function sendLobbyLeave() {
	send({cmd: "lobby leave"})
}

function sendLobbyRequestInfo(lobbyid) {
	send({cmd: "lobby info", lobbyid: lobbyid})
}

function sendLobbyRequestList() {
	send({cmd: "lobby list"})
}