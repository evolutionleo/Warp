/// @description This is the parent object for entities

use_uuid()
states = {}
state = "unknown"

// interpolation schema
__interpolation = {
	x: INTERP.LINEAR,
	y: INTERP.LINEAR,
	
	spd: {
		x: INTERP.LINEAR,
		y: INTERP.LINEAR
	}
}