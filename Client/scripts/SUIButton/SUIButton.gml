function SUIButton(x, y, text, onClick, props = {}, children = []) : SUI_ELEMENT {
	self.text = text
	self.onClick = onClick
	self.w = 128
	self.h = 48
	
	SUIInherit(self, props)
	
	init = function() {
		self.box_element = self.appendChild(new SUIBox(0, 0, self.w, self.h, {hoverable: false }))
		with(self.box_element) {
			border_w = 2
			border_color = c_white
			border_alpha = 1
			
			bg_alpha = 0
		}
		
		self.text_element = self.appendChild(new SUIText(get("w")/2, get("h")/2, text, { hoverable: false, halign: fa_center, valign: fa_middle }))
	}
	
	predraw = function(_x, _y) {
		self.forEach(function(el) {
			if (clicked) {
				el.set("y", el.get("ystart") + 3)
			}
			else {
				el.set("y", el.get("ystart"))
			}
		})
	}
}

