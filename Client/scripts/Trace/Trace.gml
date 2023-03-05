// some useful utility functions


///@function trace(... )
function trace(r) {
	r = string(r)
	
	var i;
	for (i = 1; i < argument_count; i++) {
		if string_pos("%", r) {
			r = string_replace(r, "%", string(argument[i]))
		}
		else {
			r += " " + string(argument[i])
		}
	}
	show_debug_message(r)
	// slow af
	//debug_log(r)
}


#macro stf str_format
#macro printf trace
#macro console_log trace

///@param str
function str_format(str)
{
	str = string(str)
	
	for (var i = 1; i < argument_count; i++) {
		if string_pos("%", str) {
			str = string_replace(str, "%", string(argument[i]))
		}
		else {
			str += string(argument[i])
		}
	}
	
	return str
}

function debug_log(str, file) {
	if is_undefined(file)
		file = "log.txt"
	
	global.logfile = file_text_open_append(working_directory+file)
	var prefix = "[" + window_get_caption() + "]" + "[" + date_datetime_string(date_current_datetime()) + "]"
	str = prefix + str
	file_text_write_string(global.logfile, str)
	show_debug_message("logging: " + str)
	file_text_writeln(global.logfile)
	
	file_text_close(global.logfile)
}