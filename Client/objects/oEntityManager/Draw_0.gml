/// @desc

draw_set_halign(fa_right)
draw_set_valign(fa_top)
draw_text(room_width - 10, 50, "server time: " + string(server_time()))
draw_text(room_width - 10, 80, "client time: " + string(local_timestamp()))
if (variable_instance_exists(self, "t1"))
	draw_text(room_width - 10, 110, "t1: " + string(t1))