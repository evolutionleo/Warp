/// @desc typing

if (active) {
	if (keyboard_key == vk_backspace) {
		value = string_copy(value, 1, string_length(value)-1)
	}
	else {
		value += keyboard_lastchar
	}
}