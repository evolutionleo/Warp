function sendPing() {
	//send({ cmd: "ping", t: current_time })
	send({ cmd: "ping", T: round(local_timestamp()) })
}

function sendPong(T) {
	send({ cmd: "pong", T: T })
}

function sendClientInfo() {
	send({cmd: "client info", game_version: GAME_VERSION, warp_version: WARP_VERSION })
}

function sendRequestTime() {
	send({ cmd: "server timestamp", local_time: local_timestamp() })
}