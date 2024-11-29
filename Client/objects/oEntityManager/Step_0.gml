/// @desc
// feather disable all

base_update = -1
next_update = -1
third_update = -1

entity_updates = array_filter(entity_updates, function(data) { return data.room == room_get_name(room) })

var len = array_length(entity_updates)
for(var i = 0; i < len; i++) {
	var state = entity_updates[i]
	var st = server_time()
	
	if (state.t <= st) {
		base_update = i
	}
	else {
		break
	}
}

if (base_update == -1) exit;


base_update = min(base_update, len)

array_delete(entity_updates, 0, max(0, base_update-1))
base_update = min(base_update, 1)

len = array_length(entity_updates)

// find the closest update in bounds that ideally doesn't have the same timestamp
var i;
for(i = base_update; i < len; i++) {
	if (entity_updates[i].t != entity_updates[base_update].t) or (i == len-1) {
		next_update = i
		break
	}
}

// find the third update (for quadratic intrpolation)
for(i = next_update; i < len; i++) {
	if (entity_updates[i].t != entity_updates[next_update].t) or (i == len-1) {
		third_update = i
		break
	}
}


//trace("base_update: %, next_update: %", base_update, next_update)

base_state = entity_updates[base_update]
next_state = entity_updates[next_update]
third_state = entity_updates[third_update]

t1 = base_state.t
t2 = next_state.t
t3 = third_state.t
t = server_time()

base_entities = base_state.entities
next_entities = next_state.entities
third_entities = third_state.entities

var entities = base_entities

next_e_idx = {}
third_e_idx = {}
array_foreach(next_entities, function(e, i) { next_e_idx[$ e.id] = i })
array_foreach(third_entities, function(e, i) { third_e_idx[$ e.id] = i })


var l = array_length(entities)

// for each entity
for(i = 0; i < l; i++) {
	var entity = entities[i]
				
	var uuid = entity.id
	var type = asset_get_index(entity.obj)
	if (type == -1) { // object with this type doesn't exist
		if (ALLOW_UKNOWN_ENTITIES)
				type = oEntity
		else
			throw "Error: Received unknown entity type: " + string(entity.obj) + ". Set ALLOW_UNKNOWN_ENTITIES to true to disable this error."
	}
	var props = entity.p
	var state = entity.st
	var existed = instance_exists(find_by_uuid(uuid, type))
	
	var idx2 = next_e_idx[$ uuid]
	var idx3 = third_e_idx[$ uuid]
	
	var will_exist = !is_undefined(idx2) and is_undefined(entities_to_remove[$ uuid])
	
	// don't create entities 1 frame before they are gone
	if (!existed and !will_exist) {
		continue
	}
	
	// if it was just created - it's remote
	if (!existed) {
		props.remote = true
	}
	
	if (uuid == global.player_uuid) {
		props.remote = false
	}
	
	var inst = find_or_create(uuid, type, , props)
	
	if (entities_to_remove[$ uuid]) {
		instance_destroy(inst)
		continue
	}
	
	// the reason I'm not using a with() statement here is because for some reason it is not equivallent to this, and produces weird errors (due to this being called in an Async event)
	inst.image_xscale = entity.xs
	inst.image_yscale = entity.ys
	inst.image_angle = entity.a
	inst.x = entity.x
	inst.y = entity.y
	
	if (entity[$ "fx"]) {
		inst.image_xscale *= -1
	}
	if (entity[$ "fy"]) {
		inst.image_yscale *= -1
	}
	
	inst.state = state
	
	// set the speed
	if (variable_struct_exists(entity, "spd")) {
		if (!variable_instance_exists(inst, "spd")) {
			inst.spd = {x: 0, y: 0}
		}
		inst.spd.x = entity.spd.x
		inst.spd.y = entity.spd.y
	}
				
				
	// props
	var prop_names = variable_struct_get_names(props)
	for(var j = 0; j < array_length(prop_names); j++) {
		var key = prop_names[j]
		var value = props[$ (key)]
					
		variable_instance_set(inst, key, value)
	}
	
	
	if (!is_undefined(idx2) and t2 != t1) {
		var s2 = (t2 != t1 and !is_undefined(idx2)) ? next_entities[idx2] : undefined
		var s3 = (t3 != t2 and !is_undefined(idx3)) ? third_entities[idx3] : undefined
	
		interpolateEntity(t, t1, inst, t2, s2, t3, s3)
	}
}