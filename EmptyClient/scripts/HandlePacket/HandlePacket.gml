function handlePacket(pack) {
	//trace(buffer_base64_encode(pack, 0, buffer_get_size(pack)))
	
	var data = snap_from_messagepack(pack)	// Deserialize/unpack msgpack into a struct
	var cmd = string_lower(data.cmd) // you can get rid of this line, 
									 // i just like the commands being lowercase
	
	//trace("Received cmd: %", cmd)
	
	switch(cmd) {
		case "hello":
			trace(data.str)
			break
		case "hello2":
			trace(data.str)
			break
		case "message":
			show_message_async(data.msg+"\n (c) Server")
			break
		
		// Predefined events:
		case "login":
			var status = data.status
			if (status == "fail") {
				var reason = data.reason
				show_message_async("Login failed. Reason: " + reason)
			}
			else if (status == "success") {
				global.profile = data.profile
				global.account = data.account
				show_message_async("Login success!")
			}
			else {
				show_message("Error: invalid login status")
			}
			
			break
		case "register":
			var status = data.status
			if (status == "fail") {
				show_message_async("Registration failed.")
			}
			else if (status == "success") {
				show_message_async("Registration successful! You can now login.")
			}
			else {
				show_message("Error: invalid registration status")
			}
			
			break
		case "lobby list":
			var lobbies = data.lobbies
			global.lobbies = lobbies
			break
		case "lobby info":
			var lobby = data.lobby
			for(var i = 0; i < array_length(global.lobbies); i++) {
				var _lobby = global.lobbies[i]
				if (_lobby.lobbyid == lobby.lobbyid) {
					global.lobbies[i] = lobby
				}
			}
			break
		case "lobby join":
			var lobby = data.lobby
			global.lobby = lobby
			
			sendRequestLobbies()
			break
		case "lobby reject":
			var lobby = data.lobby
			var reason = data.reason
			show_message_async("Failed to join the lobby! Reason: " + reason)
			break
		case "lobby leave":
			var lobby = data.lobby
			var reason = data.reason
			var forced = data.forced
			global.lobby = undefined
			if (forced)
				show_message_async("Kicked from the lobby! Reason: " + reason)
			else
				show_message_async("You left the lobby")
			
			sendRequestLobbies()
			
			// add your handle for lobby kick/leave logic here
			//room_goto(rMenu)
			break
		case "play":
			global.lobby = data.lobby // again, just to be safe + update the data
			var rm = asset_get_index(global.lobby.map.room_name)
			if (rm < 0) {
				show_message_async("Error: Invalid room name!")
				break
			}
			
			room_goto(rm)
			break
		
		
		// ##############################
		// Add your custom commands here:
		
		case "haha":
			var some_var = data.stuff
			trace("haha received!")
			break
		
		default:
			throw ("Error: Unknown command: " + string(data.cmd))
			break
	}
}