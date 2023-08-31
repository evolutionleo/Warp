///@function use_states(state)
///@description
// usage: call in an entity's create event
// example: use_states({ idle: 0, walk: 1, jump: 2 })
function use_states(states = {idle: 0}) {
	static entity_states = {}
	static inverse_states = {}
	
	if (!struct_exists(entity_states, object_index)) {
		// invert { walk: 1 } to { 1: walk }
		var inverse = {}
		var names = struct_get_names(states), len = struct_names_count(states)
		for(var i = 0; i < len; i++) {
			var name = [i]
			var value = states[$ name]
			
			inverse[$ string(value)] = name
		}
		
		inverse_states[$ object_index] = inverse
		entity_states[$ object_index] = states
	}
	
	
	self.states = entity_states[$ object_index]
	self.inverse_states = inverse_states[$ object_index]
}
