///@function	addHandler(cmd, handler)
///@param		{String} cmd
///@param		{Function} handler
function addHandler(cmd, handler) {
	static init = false
	if (!init) {
		if (!variable_global_exists("cmd_handlers"))
			global.cmd_handlers = {}
		init = true
	}
	
	var handler_struct = new Handler(cmd, handler)
	var first_handler = global.cmd_handlers[$ cmd]
	
	if (!is_undefined(first_handler)) {
		first_handler.append(handler_struct)
	}
	else {
		global.cmd_handlers[$ cmd] = handler_struct
	}
	
	return handler_struct
}

function removeHandler(handler) {
	handler.remove()
}

///@function	handlePacket(data)
///@param		{struct} data
function handlePacket(data) {
	// Deserialize/unpack msgpack into a struct
	var cmd = string_lower(data.cmd)	// you can get rid of the string_lower(),
																		// i just like the commands being lowercase
	
	switch(cmd) {
		// ##############################
		// You can add your custom commands below
		// or inside /cmd/handlers using addHandler(cmd, func)
		
		// simple examples:
		case "hello":
			trace(data.str)
			break
		case "message":
			show_message_async(data.msg+"\n (c) Server")
			break
		
		
		default:
			if (variable_struct_exists(global.cmd_handlers, cmd)) {
				var handler = global.cmd_handlers[$ cmd]
				while(!is_undefined(handler)) {
					handler.cb(data)
					handler = handler.next
				}
			}
			else {
				trace("Warning: Unknown cmd type: " + string(cmd))
			}
			break
	}
}


function Handler(cmd, handler) constructor {
	self.cmd = cmd
	cb = handler
	prev = undefined
	next = undefined
	
	static append = function(handler) {
		if (!is_undefined(next))
			return next.append(handler)
		else
			next = handler
	}
	
	static remove = function() {
		if(!is_undefined(prev))
			prev.next = next
		else
			global.cmd_handlers[$ cmd] = next
		
		if (!is_undefined(next)) {
			next.prev = prev
		}
	}
}