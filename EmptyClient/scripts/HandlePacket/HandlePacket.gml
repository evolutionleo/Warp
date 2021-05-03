function handlePacket(pack) {
	var data = snap_from_messagepack(pack)	// Deserialize/unpack msgpack into a struct
	var cmd = string_lower(data.cmd) // you can get rid of this line, 
									 // i just like the commands being lowercase
	
	trace("Received cmd: %", cmd)
	
	switch(cmd) {
		case "hello":
			trace(data.str)
			break
		case "hello2":
			trace(data.str)
			break
		case "message":
			show_message_async(data.msg+"\n (c) Server")
			break
		// Add your custom commands here:
		
		default:
			throw ("Error: Unknown command: " + string(data.cmd))
			break
	}
}