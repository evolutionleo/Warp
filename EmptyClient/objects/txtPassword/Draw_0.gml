/// @desc

draw_self()
var asterisks = string_repeat("*", string_length(value))
draw_set_halign(fa_left)
draw_set_valign(fa_middle)
draw_text(x, y, asterisks)