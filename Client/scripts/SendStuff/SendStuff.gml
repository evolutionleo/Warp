// All send* functions go here
function sendHello() {
	send({cmd: "hello", greeting: "hello there!"})
}

function sendMessage(msg) {
	send({cmd: "message", msg: msg})
}

function sendPing() {
	//send({ cmd: "ping", t: current_time })
	send({ cmd: "ping", T: round(local_timestamp()) })
}

function sendPong(T) {
	send({ cmd: "pong", T: T })
}

// Preset functions:

function sendJoinLobby(lobbyid) {
	send({cmd: "lobby join", lobbyid: lobbyid})
}

function sendLeaveLobby() {
	send({cmd: "lobby leave"})
}

function sendRequestLobby(lobbyid) {
	send({cmd: "lobby info", lobbyid: lobbyid})
}

function sendRequestLobbies() {
	send({cmd: "lobby list"})
}

function sendLogin(username, password) {
	send({cmd: "login", username: username, password: password})
}

function sendRegister(username, password) {
	send({cmd: "register", username: username, password: password})
}

function sendClientInfo() {
	send({cmd: "client info", game_version: GAME_VERSION, warp_version: WARP_VERSION })
}

function sendRequestTime() {
	send({ cmd: "server timestamp", local_time: local_timestamp() })
}

// ##################################
// Write your own functions down here:

// example
function sendSomeStuff() {
	send({cmd: "some stuff", foo: "blah", bar: 123})
}

function sendPlayerControls() {
	send({
		cmd: "player controls",
		move: {
			x: move_x,
			y: move_y
		},
		kright: kright,
		kleft: kleft,
		kup: kup,
		kdown: kdown,
		
		kjump: kjump,
		kjump_rel: kjump_rel,
		kjump_press: kjump_press
	})
}
