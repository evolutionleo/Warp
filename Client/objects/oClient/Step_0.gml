/// @description Reconnect & resolve packet queue

if (!connected and !connecting) {
	trace("reconnecting...")
	connect()
}

if (TIMESTAMPS_ENABLED) // sort by timestamp
	array_sort(packet_queue, function(d1,d2) { return d1.t - d2.t })

// create a copy to avoid infinite loops
var _packet_queue = []
array_copy(_packet_queue, 0, packet_queue, 0, array_length(packet_queue))

// clear the queue
packet_queue = []

// go over the queue and potentially fill it back up (the reason why we clear it beforehand)
for(var i = 0; i < array_length(_packet_queue); ++i) {
	handlePacket(_packet_queue[i])
}