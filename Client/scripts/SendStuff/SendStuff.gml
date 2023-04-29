// ##################################
// all send* functions go either here, or in cmd/senders/

// examples:
function sendHello() {
	send({cmd: "hello", greeting: "hello there!"})
}

function sendMessage(msg) {
	send({cmd: "message", msg: msg})
}


