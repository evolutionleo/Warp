function SUIDrawReset() {
	draw_set_color(c_white)
	draw_set_font(-1)
	draw_set_alpha(1.0)
	draw_set_halign(fa_left)
	draw_set_valign(fa_top)
}

function SUIElementExists(value) {
	return is_struct(value) and variable_struct_exists(value, "__is_sui_element") and value.__is_sui_element
}

function SUIDistanceToRectangle(px, py, x1, y1, x2, y2) {
	var dx = max(x1 - px, 0, px - x2)
	var dy = max(y1 - py, 0, py - y2)
	
	return sqrt(dx*dx + dy*dy)
}

#region Variable stuff

function SUIInherit(dest, src) {
	var var_names = variable_struct_get_names(src)
	var names_len = variable_struct_names_count(src)
	var i = 0
	repeat (names_len) {
		var name = var_names[i]
		var value = variable_struct_get(src, name)
		
		var dest_value = variable_struct_exists(dest, name) ? variable_struct_get(dest, name) : undefined
		if (is_struct(value) and is_struct(dest_value) and !is_method(value) and !is_method(dest_value)) {
			SUIInherit(dest_value, value)
		}
		else {
			variable_struct_set(dest, name, value)
		}
		i++
	}
	return dest
}

function SUIVarGet(scope, varname) {
	if (is_undefined(argument[1])) {
		varname = argument[0]
		scope = other
	}
	
	if (scope == global) {
		return variable_global_get(varname)
	}
	else if is_struct(scope) {
		return variable_struct_get(scope, varname)
	}
	else {
		return variable_instance_get(scope, varname)
	}
}

function SUIVarSet(scope, varname, value) {
	if (is_undefined(argument[1])) {
		varname = argument[0]
		value = argument[1]
		scope = other
	}
	
	if (scope == global) {
		variable_global_set(varname, value)
	}
	else {
		with(scope) {
			if (is_struct(self)) {
				variable_struct_set(self, varname, value)
			}
			else {
				variable_instance_set(self, varname, value)
			}
		}
	}
}

function SUIVarExists(scope, varname) {
	if (is_undefined(argument[1])) {
		varname = argument[0]
		scope = other
	}
	
	if (scope == global) {
		return variable_global_exists(varname)
	}
	else if is_struct(scope) {
		return variable_struct_exists(scope, varname)
	}
	else {
		return variable_instance_exists(scope, varname)
	}
}

#endregion