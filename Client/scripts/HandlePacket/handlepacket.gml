///@function	handlePacket(data)
///@param		{struct} data
function handlePacket(data) {
	// Deserialize/unpack msgpack into a struct
	var cmd = string_lower(data.cmd)	// you can get rid of the string_lower(),
																		// i just like the commands being lowercase
	
	//trace("Received cmd: %", cmd)
	
	switch(cmd) {
		// simple examples:
		case "hello":
			trace(data.str)
			break
		case "message":
			show_message_async(data.msg+"\n (c) Server")
			break
		
		// Predefined events:
		case "server info":
			var compatible = data.compatible
			var meta = data.meta
			trace("Info about server: %", meta)
			
			if (!compatible) {
				onIncompatible(meta.game_version)
			}
			break;
		case "server timestamp":
			var old_t = data.ct
			var new_t = local_timestamp()
			var ping = round(new_t - old_t)
			
			// the timestamp server sent + the approx. time it took to get here
			global.start_server_time = data.t + round(ping / 2)
			global.start_local_time = new_t
			
			trace("server time: %; client time: %", global.start_server_time, global.start_local_time)
			
			global.ping = ping
			break
		
		case "ping":
			sendPong(data.T)
			break
		case "pong":
			var t = data.T
			//var new_t = current_time
			var new_t = round(local_timestamp())
			var ping = new_t - t
			
			global.ping = ping
			break
		
		// Login
		case "login":
			var status = data.status
			if (status == "fail") {
				var reason = data.reason
				global.login_status = ("Login failed. Reason: " + reason)
			}
			else if (status == "success") {
				global.profile = data.profile
				global.account = data.account
				global.login_result = ("Login success!")
			}
			else {
				global.login_result = ("Error: invalid login status")
			}
			
			//show_message_async(global.login_result)
			break
		case "register":
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
			break
		
		// Lobby functions
		case "lobby list":
			var lobbies = data.lobbies
			global.lobbies = lobbies
			
			trace("recevied lobbies: %", lobbies)
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
			global.playing = false
			if (forced)
				show_message_async("Kicked from the lobby! Reason: " + reason)
			else
				show_message_async("You left the lobby")
			
			sendRequestLobbies()
			
			// add your handle for lobby kick/leave logic here
			//room_goto(rMenu)
			break
		
		case "play":
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
					break
				}
			
				room_goto(rm)
			}
			else {
				// No rooms?
				show_message_async("Rooms are disabled on the server. If this was intentional, please add custom logic to the \"play\" command inside HandlePacket.gml. If not - you can enable rooms in config.js")
			}
			break
		// changing rooms
		case "room transition":
			if (use_timestamps(data)) break;
			
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
			break
		
		// a list of entities
		case "entities":
			//if (use_timestamps(data)) break;
			
			// don't spawn in entities if we're not playing (e.x in menus)
			if (!global.playing) {
				trace("Warning: received entity, but not playing yet (or already)!")
				break
			}
			
			// don't spawn in entities from another room (can happen during room transitions)
			var from_room = data.room // the room where the entities are from
			var curr_room = room_get_name(room) // the current room
			var target_room = global.game_map.room_name // the target room
			
			if (curr_room != target_room) { // in transition right now
				queuePacket(data)
				break
			}
			else if (from_room != curr_room) {
				trace("Ignoring received entities from another room (%, we're in %)", from_room, curr_room)
				break
			}
			
			if (!instance_exists(oEntityManager))
				instance_create_depth(0, 0, 0, oEntityManager)
			
			array_push(oEntityManager.entity_updates, data)
			break
		case "entity death": // also triggers remove
			if (use_timestamps(data))
				break
			
			var uuid = data.id
			var obj = asset_get_index(data.obj)
			var inst = find_by_uuid(uuid)
			// use this for death effects, etc.
			
			break
		case "entity remove":
			if (use_timestamps(data))
				break
			
			trace("entity remove: %", data.id)
			
			var uuid = data.id
			var obj = asset_get_index(data.obj)
			var inst = find_by_uuid(uuid, obj)
			
			if (instance_exists(inst))
				instance_destroy(inst)
			break
		
		// ##############################
		// Add your custom commands here:
		
		case "player controls":
			//if (use_timestamps(data))
			//	break
			
			if (!global.playing)
				break
			
			var uuid = data.id
			var inst = find_by_uuid(uuid, oPlayer, true)
			
			with(inst) {
				kright = data.kright
				kleft = data.kleft
				kup = data.kup
				kdown = data.kdown
		
				kjump = data.kjump
				kjump_rel = data.kjump_rel
				kjump_press = data.kjump_press
				
				move_x = data.move.x
				move_y = data.move.y
			}
			break
		
		case "haha":
			var some_var = data.stuff
			trace("haha received!")
			break
		
		default:
			trace("Warning: Unknown cmd type: " + string(data.cmd))
			break
	}
}