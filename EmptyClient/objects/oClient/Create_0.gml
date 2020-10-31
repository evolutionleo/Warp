/// @desc

#region Connect!

socket = network_create_socket(network_socket_tcp)
// Async = Don't crash the game if the server is down
network_connect_raw_async(socket, IP, real(PORT));

// This can be used to initiate the server interaction
onConnect = function() {
	sendHello()
	sendHello2()
}

onDisconnect = function() {
	trace("Warning: Unhandled disconnect event!")
}

#endregion
