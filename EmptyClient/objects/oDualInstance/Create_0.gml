/// @desc

if (os_get_config() == "Prod")
	exit

window_set_fullscreen(false)

if (parameter_count() == 3) {
    shell_execute(parameter_string(0),
        parameter_string(1) + " " +
        parameter_string(2) + " " +
        parameter_string(3) + " -secondary")
    window_set_position(window_get_x() - window_get_width() div 2 - 8, window_get_y())
    // <primary instance>
    window_set_caption("P1")
}
if (parameter_count() == 4) {
    window_set_position(window_get_x() + window_get_width() div 2 + 8, window_get_y())
    // <secondary instance>
    window_set_caption("P2")
	
	// you probably want to add some logic here to disable music, etc.
}