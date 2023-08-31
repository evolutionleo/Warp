function sendMatchFind(game_mode) {
	send({ cmd: "match find", req: { game_mode } })
}

function sendMatchStop() {
	return sendMatchMakingStop()
}

function sendMatchMakingStop() {
	send({ cmd: "match stop" })
}

