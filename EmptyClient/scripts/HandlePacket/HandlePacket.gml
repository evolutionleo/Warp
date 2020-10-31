function handlePacket(pack) {
	var data = snap_from_messagepack(pack) // Deserialize msgpack into a struct
	var cmd = string_lower(data.cmd) // you can get rid of this, 
									 // i just like the commands being lowercase
	
	trace("Received cmd: %", cmd)
	
	switch(cmd) {
		case "hello":
			trace("Hello!")
			trace(data.str)
			break
		case "hello2":
			trace("Hello2!")
			trace(data.str)
			break
		case "message":
			show_message_async(data.msg)
			break
		// Add your custom commands here:
		
		default:
			throw ("Error: Unknown command: " + string(data.cmd))
			break
	}
}