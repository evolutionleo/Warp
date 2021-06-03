/// @desc

// Inherit the parent event
event_inherited();

onClick = function() {
	sendRegister(txtUsername.value, txtPassword.value)
	trace("Register sent!")
}

text = "Register"