/// @desc

#region Connect!

connect = function() {
	// if a packet is split in half, we use this
	// -1 if no half-pack, a buffer otherwise
	connecting = true
	halfpack = -1
	
	alarm[0] = CONNECT_TIMEOUT
	
	socket = network_create_socket(network_socket_tcp)
	// Async = Don't crash the game if the server is down
	network_connect_raw_async(socket, IP, real(PORT));
}

disconnect = function() {
	
}


// connect/disconnect events defined in __NetworkingConfig.gml
onConnect = global.onConnect
onDisconnect = global.onDisconnect

#endregion


connecting = false
connected = false

connect()