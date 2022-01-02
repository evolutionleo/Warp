/// @desc
//trace("Networking event triggered.")

var type = async_load[? "type"]
var buff = async_load[? "buffer"]

switch(type) {
	case network_type_data:
		// if this is the second half of a packet
		if (buffer_exists(halfpack)) {
			// concat the half packet with the freshly arrived buffer
			var new_buff = buffer_create(buffer_get_size(halfpack) + buffer_get_size(buff), buffer_fixed, 1);
			buffer_copy(halfpack, 0, buffer_get_size(halfpack), new_buff, 0);
			buffer_copy(buff, 0, buffer_get_size(buff), new_buff, buffer_get_size(halfpack));
			
			// This is the most important fix of All Time
			//buffer_delete(buff);
			buff = new_buff;
			
			buffer_delete(halfpack);
			halfpack = -1;
			
			//trace("-half out")
		}
		
		var size = buffer_get_size(buff)
		var pack_count = 0
		
		//trace("global pack size: %", size)
		
		for(var i = 0; i < size;) { // Break up the binary blob into single packets
			// Read the packet size
			if (i + 4 > size) { // cannot read the size bits (outside buffer)
				halfpack = buffer_create(size-i, buffer_fixed, 1);
				buffer_copy(buff, i, size-i, halfpack, 0);
				//trace("half in at the size bits-")
				break;
			}
			
			var packSize = buffer_peek(buff, i, buffer_u32);
			
			// if exceding the packet size
			if (i + packSize > size) {
				halfpack = buffer_create(size-i, buffer_fixed, 1);
				buffer_copy(buff, i, size-i, halfpack, 0);
				//trace("half in-")
				break;
			}
			i += 4;
			
			// Read the packet contents
			var pack = buffer_create(packSize, buffer_fixed, 1);
			buffer_copy(buff, i, packSize, pack, 0);
			
			i += packSize;
			
			try {
				var data = snap_from_messagepack(pack)
				// Handle the packet
				handlePacket(data);
			}
			catch(e) {
				trace("an error occured while parsing the packet: " + e.message)
			}
			
			pack_count++;
			
			// Clean up
			buffer_delete(pack);
		}
		
		//trace("packet_count: %", pack_count);
		
		buffer_delete(buff);
		break
	case network_type_non_blocking_connect:
		if (!async_load[? "succeeded"]) {
			trace("Non-blocking connect failed.")
			break
		} // otherwise fall into the connect case
	case network_type_connect:
		trace("Connected to the server!")
		connected = true
		connecting = false
		onConnect()
		break
	case network_type_disconnect:
		trace("Disconnected from the server!")
		connected = false
		connecting = false
		onDisconnect()
		break
}