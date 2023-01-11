function SUIText(x, y, text, props = {}, children = []) : SUI_ELEMENT {
	self.text = text
	self.color = c_white
	self.font = -1
	self.alpha = 1.0
	self.halign = fa_left
	self.valign = fa_top
	
	// readonly?
	self.text_w = 0
	self.text_h = 0
	
	draw = function(x, y) {
		draw_set_color(self.get("color"))
		draw_set_font(self.get("font"))
		draw_set_alpha(self.get("alpha"))
		draw_set_halign(self.get("halign"))
		draw_set_valign(self.get("valign"))
		
		var t = self.get("text")
		draw_text(x, y, t)
		self.set("text_w", string_width(t))
		self.set("text_h", max(string_height(t), string_height("A")))
		
		SUIDrawReset()
	}
	
	SUILoadProps(props)
}
