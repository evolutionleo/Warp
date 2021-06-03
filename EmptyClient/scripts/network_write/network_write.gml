///@function network_write(data, *socket)
///@arg data
///@arg *socket
function network_write(data, sock) {
	// most of the time you just want to send the data to oClient.socket
	if is_undefined(argument[1]) /* is_undefined(sock) */ {
		sock = oClient.socket
	}
	
	//trace("Encoding data: %", data)
	
	// the data buffer
	var buff = snap_to_messagepack(data)
	// size of the data
	var size = buffer_get_size(buff)
	
	// concat the size at the beginning to tell stuck packets apart
	var new_buff = buffer_create(size + buffer_u16, buffer_fixed, 1)
	buffer_write(new_buff, buffer_u16, size)
	buffer_copy(buff, 0, size, new_buff, 2)
	
	// send!
	network_send_raw(sock, new_buff, size+2)
	
	// Clean up
	buffer_delete(buff)
	buffer_delete(new_buff)
}


///@function send(data, *socket)
///@arg data
///@arg *socket
function send(data, sock) {
	return network_write(data, sock)
}

// P.s:
// You might need to change "_u16" and "2" everywhere to a higher power of 2
// if you're sending something more than 65535 bytes in size
// (that's because packet size is represented by a uint16)