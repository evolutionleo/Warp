/// @desc
// feather ignore all

if (keyboard_check_pressed(vk_enter)) {
	//var msg = get_string("Send a message to the server!", "Hello")
	//sendMessage(msg)
	
	var json = get_string("Send a message to the server", "{ \"cmd\": \"message\", \"msg\": \"hello\" }")
	if (json != "") {
		var data = json_parse(json)
		send(data)
	}
}

//sendLotsOfData()