/// @desc

if (keyboard_check_pressed(vk_enter)) {
	var msg = get_string("Send a message to the server!", "Hello")
	sendMessage(msg)
}

//sendLotsOfData()