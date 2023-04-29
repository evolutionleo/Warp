addHandler("play", function(data) {
	trace("playing!")
	global.playing = true
	
	global.lobby = data.lobby // again, just to be safe + update the data
	
	if (!is_undefined(data.start_pos)) {
		global.start_pos = data.start_pos
	}
	if (variable_struct_exists(data, "uuid") and !is_undefined(data.uuid)) {
		global.player_uuid = data.uuid
	}
	
	if (!is_undefined(data.room)) {
		global.room = data.room
		global.game_map = data.room.map
		
		var rm = asset_get_index(data.room.map.room_name)
		if (!room_exists(rm)) {
			show_message_async("Error: Invalid room name!")
			return
		}
		
		room_goto(rm)
	}
	else {
		// No rooms?
		show_message_async("Rooms are disabled on the server. If this was intentional, please add custom logic to the \"play\" command inside HandlePacket.gml. If not - you can enable rooms in config.js")
	}
})


// changing rooms
addHandler("room transition", function(data) {
	if (use_timestamps(data)) return;
	
	var _room = data.room
	var _map = _room.map
	
	global.room = _room
	global.start_pos = data.start_pos
	global.game_map = _map
	global.player_uuid = data.uuid
	
	var room_name = _map.room_name
	//trace("room transition: % -> %", room_get_name(room), room_name)
	
	var rm = asset_get_index(room_name)
	if (!room_exists(rm)) {
		show_message_async("Error: Invalid room name!")
	}
	else {
		room_goto(rm)
	}
})


addHandler("game over", function(data) {
	show_message_async("Game over! " + string(data.reason) + " " + string(data.outcome))
})