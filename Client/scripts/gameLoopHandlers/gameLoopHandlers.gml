addHandler("match found", function(data) {
	var match = data.match
	
	var map = match.map
	var teams = match.teams
	var parties = match.parties
	
	global.map = map
	trace("Match found!", data)
})

addHandler("match denied", function(data) {
	room_goto(rMenu)
	var s = $"Match denied (reason: {data.reason})"
	show_message_async(s)
	trace(s)
})

addHandler("play", function(data) {
	trace("playing!")
	global.playing = true
	
	global.lobby = data.lobby // again, just to be safe + update the data
	global.game_map = data.lobby.map
	
	if (!is_undefined(data.start_pos)) {
		global.start_pos = data.start_pos
	}
	if (variable_struct_exists(data, "uuid") and !is_undefined(data.uuid)) {
		global.player_uuid = data.uuid
	}
	
	if (!is_undefined(data.room)) {
		global.room = data.room
		global.game_level = data.room.level
		
		var rm = asset_get_index(data.room.level.room_name)
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
	var _level = _room.level
	
	global.room = _room
	global.start_pos = data.start_pos
	global.game_level = _level
	global.player_uuid = data.uuid
	
	var room_name = _level.room_name
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
	show_message_async($"Game over! ({data.outcome}), reason: {data.reason}")
})

addHandler("mmr change", function(data) {
	var delta = data.delta
	var new_mmr = data.new_mmr
})