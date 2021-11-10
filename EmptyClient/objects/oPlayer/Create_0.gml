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
	return place_meeting(x, y+1, oWall)
}