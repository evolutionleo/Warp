///@function network_write(data, *socket)
///@arg data
///@arg *socket
// most of the time you just want to send the data to oClient.socket
function network_write(data, sock = oClient.sock) {
	if (!oClient.connected)
		return -1
	
	if (TIMESTAMPS_ENABLED) {
		data.t = local_timestamp() // ms since the client started
	}
	
	// the data buffer
	var buff = snap_to_messagepack(data)
	// size of the data
	var size = buffer_get_size(buff)
	
	if (SOCKET_TYPE == SOCKET_TYPES.TCP) {
		// concat the size at the beginning to tell stuck packets apart
		var new_buff = buffer_create(size + 4, buffer_fixed, 1)
		buffer_write(new_buff, buffer_u32, size)
		buffer_copy(buff, 0, size, new_buff, 4)
	
		// send!
		var status = network_send_raw(sock, new_buff, size+4)
		
		// cleanup
		buffer_delete(new_buff)
	}
	else {
		// send without the size bits
		var status = network_send_raw(sock, buff, size, network_send_binary)
	}
	
	// Clean up
	buffer_delete(buff)
	
	if (status < 0) {
		trace("Failed to send data: status code %", status)
		oClient.disconnect()
	}
}


///@function send(data, *socket)
///@arg data
///@arg *socket
function send(data, sock = oClient.socket) {
	return network_write(data, sock)
}