/// @desc

#region Connect!

connect = function() {
	// if a packet is split in half, we use this
	// -1 if no half-pack, a buffer otherwise
	connecting = true
	connected = false
	halfpack = -1
	
	alarm[0] = CONNECT_TIMEOUT
	
	if (variable_instance_exists(id, "socket"))
		network_destroy(socket)
	
	socket = network_create_socket(SOCKET_TYPE)
	var port
	
	if (SOCKET_TYPE == SOCKET_TYPES.TCP) {
		port = PORT
	}
	else {
		port = WS_PORT
	}
	
	// Async = Don't crash the game if the server is down
	network_connect_raw_async(socket, IP, real(port));
}

// connect/disconnect events are defined in __NetworkingConfig.gml
//onConnect = global.onConnect
//onDisconnect = global.onDisconnect

#endregion

packet_queue = []

connecting = false
connected = false

connect()