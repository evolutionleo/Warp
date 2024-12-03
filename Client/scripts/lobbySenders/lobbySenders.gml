function sendLobbyJoin(lobby_id) {
	send({cmd: "lobby join", lobby_id: lobby_id})
}

function sendLobbyLeave() {
	send({cmd: "lobby leave"})
}

function sendLobbyRequestInfo(lobby_id) {
	send({cmd: "lobby info", lobby_id: lobby_id})
}

function sendLobbyRequestList() {
	send({cmd: "lobby list"})
}