
draw_self()

draw_set_halign(fa_center)

// draw a tiny arrow above us
if (!remote)
	draw_text((bbox_right + bbox_left) / 2, bbox_top - 20, self.name)