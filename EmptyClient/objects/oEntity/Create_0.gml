/// @description This is the parent object for entities

use_uuid()

if (TIMESTAMPS_ENABLED) {
	if (!variable_instance_exists(id, "__last_timestamp")) 
		__last_timestamp = -1
}