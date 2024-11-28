function sendLogin(username, password) {
	send({cmd: "login", username: username, password: password})
}

function sendRegister(username, password) {
	send({cmd: "register", username: username, password: password})
}

function sendNameGet() {
	send({cmd: "name get"})
}

function sendSessionCreate() {
	send({cmd: "session create"})
}

function sendSessionLogin(session) {
	send({cmd: "session login", session})
}

function sendSession() {
	if (file_exists(SESSION_FILE)) {
		var file = file_text_open_read(SESSION_FILE)
		var session = file_text_read_string(file)
		file_text_close(file)
		
		trace(SESSION_FILE)
		trace("read session: %", session)
		
		global.session = session
		sendSessionLogin(session)
	}
	else {
		sendSessionCreate()
	}
}