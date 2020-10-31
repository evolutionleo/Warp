/// @desc
//trace("Networking event triggered.")

var type = async_load[? "type"]
var buff = async_load[? "buffer"]
var size = async_load[? "size"]

switch(type) {
	case network_type_data:
		for(var i = 0; i < size;) { // Break up the binary blob into single packets
			// Read the packet size
			var packSize = buffer_read(buff, buffer_u16);
			i += 2;
			
			// Read the packet contents
			var pack = buffer_create(1, buffer_grow, 1);
			buffer_copy(buff, i, packSize, pack, 0);
			i += packSize;
			
			// Handle the packet
			handlePacket(pack);
			
			// Clean up
			buffer_delete(pack);
		}
		
		buffer_delete(buff);
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