/// @description Insert description here
// You can write your code in this editor
if (place_meeting(x + spd.x, y, oWall)) {
	spd.x = 0
}
x += spd.x

if (place_meeting(x, y + spd.y, oWall)) {
	spd.y = 0
}
y += spd.y