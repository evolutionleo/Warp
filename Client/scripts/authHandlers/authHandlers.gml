addHandler("name set", function(data) {
	global.username = data.name
})

addHandler("login", function(data) {
	var success = data.success
	if (success) {
		global.profile = data.profile
		global.account = data.account
		global.username = global.account.username
		global.login_result = ("Login success!")
	}
	else {
		global.login_result = ("Login failed. Reason: " + data.reason)
		
	}
})


addHandler("register", function(data) {
	var success = data.success
	if (success) {
		global.login_result = ("Registration successful! You can now login.")
	}
	else {
		global.login_result = ("Registration failed. Reason: " + data.reason)
	}
	
	trace(global.login_result)
})



var sessionHandler = function(data) {
	if (data.success) {
		var session = data.session
		
		// we save the history of all old sessions just in case
		if (file_exists(SESSION_FILE) and OLD_SESSIONS_FILE != "") {
			var f1 = file_text_open_read(SESSION_FILE)
			var f2 = file_text_open_append(OLD_SESSIONS_FILE)
			file_text_write_string(f2, file_text_read_string(f1))
			file_text_writeln(f2)
			file_text_close(f1)
			file_text_close(f2)
		}
		
		// write the new received session
		var file = file_text_open_write(SESSION_FILE)
		file_text_write_string(file, session)
		file_text_close(file)
		
		global.session = session
		
		if (data.cmd == "session create") {
			trace("Session created successfully.")
		}
		else if (data.cmd == "session login") {
			trace("Session login successful.")
		}
	}
	else {
		if (data.cmd == "session create") {
			trace("Failed to create a session. Reason: %", data.reason)
		}
		else if (data.cmd == "session login") {
			trace("Failed to login with a session. Reason: %", data.reason)
			
			// create a new session if the old one didn't work
			//sendSessionCreate()
		}
	}
}


addHandler("session create", sessionHandler)
addHandler("session login", sessionHandler)