// All send* functions go here
function sendHello() {
	network_write({cmd: "hello", kappa: "Kappa Pepega"})
}

function sendHello2() {
	network_write({cmd: "hello2", kappa: "Second Kappa"})
}

function sendMessage(msg) {
	network_write({cmd: "message", msg: msg})
}
// Write your own functions down here:
