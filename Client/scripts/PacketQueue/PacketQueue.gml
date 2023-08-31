///@function	queuePacket(data)
///@param		{struct} data
function queuePacket(data) {
	var c = instance_find(oClient, 0)
	
	if (!variable_instance_exists(c, "packet_queue"))
		c.packet_queue = []
	
	array_push(c.packet_queue, data)
}