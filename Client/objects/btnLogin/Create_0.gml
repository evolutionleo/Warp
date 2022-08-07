/// @desc

// Inherit the parent event
event_inherited();

onClick = function() {
	sendLogin(txtUsername.value, txtPassword.value)
	trace("Login sent!")
}

text = "Login"