// feather ignore GM1044

event_inherited()

spd = {x: 0, y: 0}
grv = {x: 0, y: .4}


meetingSolid = function(_x, _y) {
	static solid_objects = tag_get_asset_ids("solid", asset_object)
	static solid_len = array_length(solid_objects)
	for(var i = 0; i < solid_len; ++i) {
		var obj = solid_objects[i]
		if (place_meeting(_x, _y, obj))
			return true
	}
	return false
}
