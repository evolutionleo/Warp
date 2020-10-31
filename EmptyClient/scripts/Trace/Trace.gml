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
}


#macro stf str_format
#macro printf trace

///@param str
///@param ...
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
	
	global.logfile = file_text_open_write(working_directory+file)
	file_text_write_string(global.logfile, str)
	file_text_writeln(global.logfile)
	
	file_text_close(global.logfile)
}