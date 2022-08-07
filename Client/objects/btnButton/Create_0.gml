/// @desc Basic button

onClick = function() {
	
}

text = "button"

on_mouse = function() {
	return point_in_rectangle(mouse_x, mouse_y, bbox_left, bbox_top, bbox_right, bbox_bottom)
}