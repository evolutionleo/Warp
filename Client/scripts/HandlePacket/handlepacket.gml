///@function	handlePacket(data)
///@param		{struct} data
function handlePacket(data) {
	// Deserialize/unpack msgpack into a struct
	var cmd = string_lower(data.cmd)	// you can get rid of the string_lower(),
																		// i just like the commands being lowercase
	
	//trace("Received cmd: %", cmd)
	
	switch(cmd) {
		case "hello":
			trace(data.str)
			break
		case "message":
			show_message_async(data.msg+"\n (c) Server")
			break
		case "server info":
			var compatible = data.compatible
			var meta = data.meta
			trace("Info about server: %", meta)
			
			if (!compatible) {
				onIncompatible(meta.game_version)
			}
			break;
		case "ping":
			sendPong(data.t)
			break
		case "pong":
			var t = data.t
			//var new_t = current_time
			var new_t = round(get_timer() / 1000)
			var ping = new_t - t
			
			global.ping = ping
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
		
		case "party join":
			
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
		
		// data about the entity
		case "entities":
			//trace("received entities from room %: %", data.room, array_length(data.entities))
			
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
			
			if (from_room != curr_room) {
				trace("Ignoring received entities from another room (%, we're in %)", from_room, curr_room)
				break
			}
			
			
			var entities = data.entities
			var l = array_length(entities)
			
			// for each entity
			for(var i = 0; i < l; i++) {
				var entity = entities[i]
				
				var uuid = entity.id
				var type = asset_get_index(entity.object_name)
				var props = entity.props
				var existed = instance_exists(find_by_uuid(uuid, type))
				var inst = find_or_create(uuid, type)
				
			
				// if it was just created - it's remote
				if (!existed) {
					inst.remote = true
					inst.x = entity.x
					inst.y = entity.y
				}
				
				if (uuid == global.player_uuid) {
					inst.remote = false
				}
			
				// the reason I'm not using a with() statement here is because for some reason it is not equivallent to this, and produces weird errors (due to this being called in an Async event)
				inst.image_xscale = entity.xscale
				inst.image_yscale = entity.yscale
			
				// position interpolation
				if (POS_INTERPOLATION <= 0 or POS_INTERPOLATION > 1							// interpolation disabled
				or point_distance(inst.x, inst.y, entity.x, entity.y) > POS_INTERP_THRESH) {	// or hit the interpolation threshold
					inst.x = entity.x // snap to just x and y
					inst.y = entity.y
				}
				else { // interpolate
					inst.x = lerp(inst.x, entity.x, POS_INTERPOLATION)
					inst.y = lerp(inst.y, entity.y, POS_INTERPOLATION)
				}
			
				// set the speed
				if (variable_struct_exists(entity, "spd")) {
					if (!variable_instance_exists(inst, "spd")) {
						inst.spd = {x: 0, y: 0}
					}
					inst.spd.x = entity.spd.x
					inst.spd.y = entity.spd.y
				}
				
				
				// props
				var propNames = variable_struct_get_names(props)
				//trace(propNames)
				//trace(array_length(propNames))
				for(var j = 0; j < array_length(propNames); j++) {
					var key = propNames[j]
					var value = props[$ (key)]
					
					variable_instance_set(inst, key, value)
				}
			}
			break
		case "entity death": // also triggers remove
			var uuid = data.id
			var inst = find_by_uuid(uuid)
			// use this for death effects
			
			break
		case "entity remove":
			var uuid = data.id
			var inst = find_by_uuid(uuid, all)
			if (instance_exists(inst))
				instance_destroy(inst)
			break
		
		// ##############################
		// Add your custom commands here:
		
		case "player controls":
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