/// @desc

// this is a singleton object
if (instance_number(object_index) > 1) instance_destroy()


entity_updates  = [] // a list of packets with cmd: "entities"

base_update = -1
next_update = -1
third_update = -1

entities_to_remove = {}

interpolateEntity = function(t, t1, inst, t2, s2, t3, s3) {
	var var_names = variable_struct_get_names(inst.__interpolation)
	for(var i = 0; i < array_length(var_names); i++) {
		var var_name = var_names[i]
		
		// use the inst.__interpolation schema for reference
		if (!variable_struct_exists(inst.__interpolation, var_name))
			continue
		var interp = variable_struct_get(inst.__interpolation, var_name)
		
		var v1 = variable_instance_get(inst, var_name)
		var v2 = is_undefined(s2) ? undefined : variable_struct_get(s2, var_name)
		var v3 = is_undefined(s3) ? undefined : variable_struct_get(s3, var_name)
		
		var value = undefined
		
		if (var_name == "x" or var_name == "y") and (abs(v2 - v1) > POS_INTERP_THRESH) {
			value = v1
		}
		else if (is_struct(v1)) {
			value = interpolateStruct(t, t1, v1, t2, v2, t3, v3, interp)
		}
		else {
			value = interpolate(t, t1, v1, t2, v2, t3, v3, interp)
		}
		
		variable_instance_set(inst, var_name, value)
	}
}