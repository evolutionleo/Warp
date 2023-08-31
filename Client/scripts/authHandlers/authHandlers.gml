addHandler("name set", function(data) {
	global.username = data.name
})

addHandler("login", function(data) {
	var status = data.status
	if (status == "fail") {
		var reason = data.reason
		global.login_status = ("Login failed. Reason: " + reason)
	}
	else if (status == "success") {
		global.profile = data.profile
		global.account = data.account
		global.username = global.account.username
		global.login_result = ("Login success!")
	}
	else {
		global.login_result = ("Error: invalid login status")
	}
	
	//show_message_async(global.login_result)
})


addHandler("register", function(data) {
	var status = data.status
	if (status == "fail") {
		global.login_result = ("Registration failed.")
	}
	else if (status == "success") {
		global.login_result = ("Registration successful! You can now login.")
	}
	else {
		global.login_result = ("Error: invalid registration status")
	}
	
	//show_message_async(global.login_result)
})