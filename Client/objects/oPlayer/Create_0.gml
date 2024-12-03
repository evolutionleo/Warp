/// @description initialize some constants

// Inherit the parent event
event_inherited();

use_states({ idle: 0, walk: 1 })

name = ""

// controls
inputs = {
	kright	: false,
	kleft	: false,
	kup		: false,
	kdown	: false,

	kjump		: false,
	kjump_rel	: false,
	kjump_press : false,

	move: {
		x: 0,
		y: 0
	}
}