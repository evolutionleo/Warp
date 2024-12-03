/// @description platformer inputs logic

if (!remote) {
	with (inputs) {
		kup = keyboard_check(ord("W")) || keyboard_check(vk_up)
		kleft = keyboard_check(ord("A")) || keyboard_check(vk_left)
		kdown = keyboard_check(ord("S")) || keyboard_check(vk_down)
		kright = keyboard_check(ord("D")) || keyboard_check(vk_right)
	
		kjump = keyboard_check(vk_space)
		kjump_press = keyboard_check_pressed(vk_space)
		kjump_rel = keyboard_check_released(vk_space)
	
		move.x = kright - kleft
		move.y = kdown - kup
	}
	
	
	sendPlayerControls(inputs)
}

if (state == states.walk) {
	
}