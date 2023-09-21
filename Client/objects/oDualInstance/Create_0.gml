/// @desc

// a macro set in the config file
if (!DUAL_INSTANCE) {
	instance_destroy()
	exit
}

window_set_fullscreen(false)

var exe = string_replace_all(parameter_string(0), "/", "\\")

//execute_shell_simple(parameter_string(0))
//execute_shell_simple(exe)

execute_shell_simple("C:\\Program Files\\Notepad++\\notepad++.exe")
execute_shell_simple("C:\\ProgramData\\GameMakerStudio2\\Cache\\runtimes\\runtime-2023.8.0.145\\windows\\x64\\Runner.exe")

//show_message(exe + " " + parameter_string(1) + " " +
//	        parameter_string(2) + "fin")

trace(exe + " " + parameter_string(1) + " " +
	        parameter_string(2) + " " + parameter_string(3) + "fin")

trace(parameter_count())

//execute_shell_simple("C:\ProgramData\GameMakerStudio2\Cache\runtimes\runtime-2023.8.0.145\windows\x64\Runner.exe")

if (parameter_count() == 3) {
	//repeat(DUAL_INSTANCE_COUNT) {
	    execute_shell_simple(exe,
	        parameter_string(1) + " " +
	        parameter_string(2) + " " +
			parameter_string(3) + " -secondary")
	//}
	
    window_set_position(window_get_x() - window_get_width() / 2, window_get_y())
    // <primary instance>
    window_set_caption("P1")
}
if (parameter_count() == 4) {
    window_set_position(window_get_x() + window_get_width() / 2, window_get_y())
    // <secondary instance>
    window_set_caption("P2")
	
	// you probably want to add some logic here to disable music, etc.
	onSecondWindow()
}