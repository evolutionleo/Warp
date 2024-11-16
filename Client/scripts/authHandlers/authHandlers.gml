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


addHandler("session create", function(data) {
	if (data.success) {
		var file = file_text_open_write("session.token")
		file_text_write_string(file, data.session)
		file_text_close(file)
	}
	else {
		trace("Failed to create a session. Reason: %", data.reason)
	}
})

addHandler("session login", function(data) {
	var success = data.success
	
	
})