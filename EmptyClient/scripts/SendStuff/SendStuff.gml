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

function sendRequestLobbies() {
	send({cmd: "lobby list"})
}

function sendLogin(username, password) {
	send({cmd: "login", username: username, password: password})
}

function sendRegister(username, password) {
	send({cmd: "register", username: username, password: password})
}

// Write your own functions down here:

function sendLotsOfData() {
	var arr = []
	//for(var i = 0; i < 10; i++) {
	//	//arr[i] = irandom(1000000)
	//	arr[i] = 999999
		
	//	network_write({cmd: "haha", r: arr[i]})
	//}
	repeat(70)
		send({ cmd: "haha", r: 100 })
	
	var single_pack = snap_to_messagepack({ cmd: "haha", r: 100 })
	var a = 10
	//repeat(10) {
		//network_write({cmd: "ping", time: current_time*400})
	//}
}