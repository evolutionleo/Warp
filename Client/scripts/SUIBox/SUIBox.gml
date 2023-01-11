function SUIBox(x, y, w, h, props = {}, children = []) : SUI_ELEMENT {
	self.w = w
	self.h = h
	
	bg_color = c_black
	bg_alpha = 1.0
	border_w = 1
	border_color = c_white
	border_alpha = 1.0
	
	SUIInherit(self, props)
	
	draw = function(x, y) {
		var w = get("w")
		var h = get("h")
		var bw = get("border_w")
		// fill the bg
		draw_set_color(get("bg_color"))
		draw_set_alpha(get("bg_alpha"))
		draw_rectangle(x, y, x + w, y + h, false)
		
		// draw the border as 4 (thick?) lines
		if (get("border_alpha") > 0 and bw > 0) {
			draw_set_color(get("border_color"))
			draw_set_alpha(get("border_alpha"))
			
			// top
			draw_line_width(x-bw/2, y, x+w+bw/2, y, bw)
			// left
			draw_line_width(x, y-bw/2, x, y+h+bw/2, bw)
			// right
			draw_line_width(x+w, y-bw/2, x+w, y+h+bw/2, bw)
			// bottom
			draw_line_width(x-bw/2, y+h, x+w+bw/2, y+h, bw)
		}
		
		SUIDrawReset()
	}
}
