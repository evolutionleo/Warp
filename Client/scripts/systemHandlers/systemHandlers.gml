addHandler("invalid input", function(data) {
	trace("ERROR: Invalid input for CMD '%': %", data.c, string(data.e))
})

addHandler("server info", function(data) {
	var compatible = data.compatible
	var meta = data.meta
	trace("Info about server: %", meta)
	
	if (!compatible) {
		onIncompatible(meta.game_version)
	}
})

addHandler("server kick", function(data) {
	show_message("Kicked from the server! Reason: " + data.reason ?? "???")
	game_end()
})

addHandler("server timestamp", function(data) {
	var old_t = data.ct
	var new_t = local_timestamp()
	var ping = round(new_t - old_t)
	
	global.start_server_time = data.t
	global.start_local_time = new_t
	
	//trace("server time: %; client time: %", global.start_server_time, global.start_local_time)
	
	if (AUTOADJUST_SERVER_DELAY) {
		if (ping < 100)
			global.server_time_delay = 50
		else
			global.server_time_delay = 100 * ceil(ping / 100)
	}
	
	global.ping = ping
})

addHandler("ping", function(data) {
	sendPong(data.T)
})

addHandler("pong", function(data) {
	static last_pings = []
	var max_pings = 20
	
	var t = data.T
	//var new_t = current_time
	var new_t = round(local_timestamp())
	var ping = new_t - t
	
	array_push(last_pings, ping)
	if (array_length(last_pings) > max_pings) {
		array_delete(last_pings, 0, 1)
	}
	
	var sum = array_reduce(last_pings, function(prev, v) { return prev + v })
	var avg_ping = sum / array_length(last_pings)
	
	if (AUTOADJUST_SERVER_DELAY) {
		global.server_time_delay = 100 * ceil(avg_ping / 100)
	}
	
	global.ping = ping
})