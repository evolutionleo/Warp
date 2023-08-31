///@function	local_timestamp()
///@returns		{real} ms
function local_timestamp() {
	gml_pragma("forceinline")
	return get_timer() / 1000
}

// expected current server time in ms
function server_time() {
	gml_pragma("forceinline")
	return global.start_server_time + (local_timestamp() - global.start_local_time) - SERVER_TIME_DELAY
}


///@function	use_timestamps(data)
///@param		{struct} data
///@returns		{bool} result - true if the packet should be delayed, false if it should be handled right now
/// usage [inside handlePacket.gml]:  if (use_timestamps(data)) break;
function use_timestamps(data) {
	if (!TIMESTAMPS_ENABLED) return false;
	
	var t = data.t
	if (t <= server_time())
		return false
	else {
		queuePacket(data)
		return true
	}
}