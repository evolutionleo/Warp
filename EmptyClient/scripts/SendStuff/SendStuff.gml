// All send* functions go here
function sendHello() {
	send({cmd: "hello", kappa: "Kappa Pepega"})
}

function sendHello2() {
	send({cmd: "hello2", kappa: "Second Kappa"})
}

function sendMessage(msg) {
	send({cmd: "message", msg: msg})
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

// ##################################
// Write your own functions down here:

// example
function sendSomeStuff() {
	send({cmd: "some stuff", foo: "blah", bar: 123})
}

