///@function	queuePacket(data)
///@param		{struct} data
function queuePacket(data) {
	if (!variable_instance_exists(oClient, "packet_queue"))
		oClient.packet_queue = []
	
	array_push(oClient.packet_queue, data)
}