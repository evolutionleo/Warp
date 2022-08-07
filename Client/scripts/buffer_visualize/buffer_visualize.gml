function buffer_visualize(buff) {
	var str = "Buffer <"
	var size = buffer_get_size(buff)
	
	for(var pos = 0; pos < size; ) {
		var n = buffer_peek(buff, pos, buffer_u8)
		str += string_replace(string(ptr(n)), "000000", "") + " "
		pos += 1
	}
	
	str += ">"
	return str
}