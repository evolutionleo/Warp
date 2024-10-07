// a list of entities
addHandler("entities", function(data) {
	
	// don't spawn in entities if we're not playing (e.x in menus)
	if (!global.playing) {
		trace("Warning: received entity, but not playing yet (or already)!")
		return;
	}
	
	// don't spawn in entities from another room (can happen during room transitions)
	var from_room = data.room // the room where the entities are from
	var curr_room = room_get_name(room) // the current room
	var target_room = global.game_level.room_name // the target room
			
	if (curr_room != target_room) { // in transition right now
		queuePacket(data)
		return;
	}
	else if (from_room != curr_room) {
		trace("Ignoring received entities from another room (%, we're in %)", from_room, curr_room)
		return;
	}
			
	if (!instance_exists(oEntityManager))
		instance_create_depth(0, 0, 0, oEntityManager)
			
	array_push(oEntityManager.entity_updates, data)
})


addHandler("entity death", function(data) { // also triggers remove
	if (use_timestamps(data))
		return;
	
	var uuid = data.id
	var obj = asset_get_index(data.obj)
	var inst = find_by_uuid(uuid)
	// you can use this for death effects, etc.
})


addHandler("entity remove", function(data) {
	if (use_timestamps(data))
		return;
	
	var uuid = data.id
	var obj = asset_get_index(data.obj)
	var inst = find_by_uuid(uuid, obj)
	
	if (instance_exists(oEntityManager))
		oEntityManager.entities_to_remove[$ uuid] = true
	
	if (instance_exists(inst))
		instance_destroy(inst)
})