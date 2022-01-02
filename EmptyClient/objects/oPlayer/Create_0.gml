/// @description initialize some constants

// Inherit the parent event
event_inherited();



walksp = 7
jumpHeight = 12.5
cutJump = true


jump = function() {
	spd.y = -jumpHeight
	cutJump = false
}

grounded = function() {
	return meetingSolid(x, y+1, oWall)
}



// controls
kright	= false
kleft	= false
kup		= false
kdown	= false

kjump		= false
kjump_rel	= false
kjump_press = false

move_x = 0
move_y = 0