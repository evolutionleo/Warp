/// @desc

if (instance_number(oClient) > 1) {
	instance_destroy()
	exit
}

#region Connect!

connect = function() {
	if (connected)
		disconnect()
	
	connecting = true
	connected = false
	
	// if a packet is split in half, we use this
	// -1 if no half-pack, a buffer otherwise
	halfpack = -1
	
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

disconnect = function() {
	if (connected) {
		if (!is_undefined(socket))
			network_destroy(socket)
		
		connected = false
		connecting = false
		socket = undefined
		global.ping = -1
		onDisconnect()
	}
}

// connect/disconnect events are defined in __NetworkingConfig.gml
//onConnect = global.onConnect
//onDisconnect = global.onDisconnect

#endregion

packet_queue = []

connecting = false
connected = false
socket = undefined

connect()