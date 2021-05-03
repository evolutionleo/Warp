/// @desc
//trace("Networking event triggered.")

var type = async_load[? "type"]
var buff = async_load[? "buffer"]

switch(type) {
	case network_type_data:
		var size = async_load[? "size"]
		var pack_count = 0
		
		for(var i = 0; i < size;) { // Break up the binary blob into single packets
			// Read the packet size
			var packSize = buffer_peek(buff, i, buffer_u16); // this also seeks
			i += 2;
			
			// Read the packet contents
			var pack = buffer_create(1, buffer_grow, 1);
			buffer_copy(buff, i, packSize, pack, 0);
			
			i += packSize;
			
			// Handle the packet
			handlePacket(pack);
			
			pack_count++;
			
			// Clean up
			buffer_delete(pack);
		}
		
		buffer_delete(buff);
		
		//trace("Packs received: %", pack_count);
		break
	case network_type_non_blocking_connect:
	case network_type_connect:
		trace("Connected to the server!")
		onConnect()
		break
	case network_type_disconnect:
		trace("Disconnected from the server!")
		onDisconnect()
		break
}