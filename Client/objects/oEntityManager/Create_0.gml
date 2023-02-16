/// @desc

// this is a singleton object
if (instance_number(object_index) > 1) instance_destroy()


entity_updates  = [] // a list of packets with cmd: "entities"

base_update = -1
next_update = -1