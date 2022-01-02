///@function	handlePacket(pack)
///@param		{buffer} pack
function handlePacket(pack) {
	// Deserialize/unpack msgpack into a struct
	var data = snap_from_messagepack(pack)
	var cmd = string_lower(data.cmd)	// you can get rid of the string_lower(),
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
			global.playing = true
			
			global.lobby = data.lobby // again, just to be safe + update the data
			global.room = data.room
			global.game_map = data.room.map
			if (variable_struct_exists(data, "uuid")) {
				global.player_uuid = data.uuid
			}
			var rm = asset_get_index(data.room.map.room_name)
			global.start_pos = data.start_pos
			if (!room_exists(rm)) {
				show_message_async("Error: Invalid room name!")
				break
			}
			
			room_goto(rm)
			break
		case "room transition":
			var _room = data.room
			
			
			break
		
		// data about the entity
		case "entities":
			// don't spawn in entities if we're not playing (e.x in menus)
			if (!global.playing) {
				trace("Warning: received entity, but not playing yet (or already)!")
				break
			}
			//trace("entities received")
			
			var entities = data.entities
			var l = array_length(entities)
			
			for(var i = 0; i < l; i++) {
				var entity = entities[i]
				
				//trace("entity: %", entity)
				
				var uuid = entity.id
				var type = asset_get_index(entity.object_name)
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
					inst.x = entity.x
					inst.y = entity.y
				}
				else {
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
			throw ("Error: Unknown command: " + string(data.cmd))
			break
	}
}