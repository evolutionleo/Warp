/// @desc

base_update = -1
next_update = -1

entity_updates = array_filter(entity_updates, function(data) { return data.room == room_get_name(room) })

var len = array_length(entity_updates)
for(var i = 0; i < len; i++) {
	var state = entity_updates[i]
	
	if (state.t > server_time()) {
		base_update = i - 1
		break
	}
}


if (base_update < 0)
	exit


array_delete(entity_updates, 0, max(0, base_update-1))
base_update = min(base_update, 0)
next_update = min(base_update + 1, array_length(entity_updates)-1)

trace("base_update: %, next_update: %", base_update, next_update)

base_state = entity_updates[base_update]
next_state = entity_updates[next_update]

base_t = base_state.t
next_t = next_state.t

base_entities = base_state.entities
next_entities = next_state.entities
var entities = []

interp = (server_time() - base_t) / (next_t - base_t)

if (base_update != next_update) {
	var ids_indices = {}
	for(var i = 0; i < array_length(next_entities); i++) {
		var e = next_entities[i]
		ids_indices[$ e.id] = i
	}
	
	for(var i = 0; i < array_length(base_entities); i++) {
		var entity = base_entities[i]
		
		var next_idx = ids_indices[$ entity.id]
		if (!is_undefined(next_idx)) {
			var entity_next = next_entities[next_idx]
			entity.x = lerp(entity.x, entity_next.x, interp)
			entity.y = lerp(entity.y, entity_next.y, interp)
		}
		array_push(entities, entity)
	}
}

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
	inst.x = entity.x
	inst.y = entity.y
			
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