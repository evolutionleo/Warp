function SUITextInput(x, y, w = 192, h = 48, text = "", placeholder = "", props = {}, children = []) : SUI_ELEMENT {
	self.selectable = true // disable this to turn this into a plain textbox without input
	
	self.w = w
	self.h = h
	
	self.text = text
	self.placeholder_text = placeholder
	
	self.disable_placeholder_on_select = false
	
	self.max_length = 18
	
	self.cursor_sprite = sSimpleUITextCursor
	self.cursor_blink = 50 // time that it stays on
	self.cursor_unblink = 30 // time that it stays off
	
	self.cursor_blink_timer = 0
	self.cursor_blink_state = true
	
	self.box_element = undefined
	self.text_element = undefined
	self.placeholder_element = undefined
	
	init = function() {
		var bx = 0, by = 0, bw = get("w"), bh = get("h")
		self.box_element = appendChild(new SUIBox(bx, by, bw, bh, props))
		
		var tx = 10, ty = get("h")/2
		self.text_element = appendChild(new SUIText(tx, ty, SUIBind("self.text", "self.text"), props))
		
		var cx = 190, cy = get("h")/2
		self.cursor_element = appendChild(new SUISprite(cx, cy, sSimpleUITextCursor, 0))
		
		var px = 10, py = get("h")/2
		self.placeholder_element = appendChild(new SUIText(px, py, SUIBind("self.placeholder_text", "self.placeholder_text")))
		
		box_element.hoverable = false
		text_element.hoverable = false
		cursor_element.hoverable = false
		
		box_element.bg_alpha = 0
		placeholder_element.alpha = .5
		text_element.halign = fa_left
		text_element.valign = fa_middle
		placeholder_element.halign = fa_left
		placeholder_element.valign = fa_middle
		
		cursor_element.equal_scaling = true
	}
	
	onSelect = function() {
		keyboard_string = get("text")
		cursor_blink_state = 1
	}
	
	step = function() {
		if (selected) { // we're the selected element
			if (string_length(keyboard_string) < self.max_length) {
				set("text", keyboard_string)
			}
			else {
				keyboard_string = get("text")
			}

			cursor_blink_timer++
			if (cursor_blink_state and cursor_blink_timer >= cursor_blink) or (!cursor_blink_state and cursor_blink_timer >= cursor_unblink) {
				cursor_blink_state = !cursor_blink_state
				cursor_blink_timer = 0
			}
		}
		else {
			cursor_blink_state = false
			cursor_blink_timer = 0
			set("cursor_blink_state", false)
		}
		
		cursor_element.set("visible", cursor_blink_state)
		cursor_element.set("x", text_element.get("x") + text_element.get("text_w") + 1)
		cursor_element.set("h", text_element.get("text_h"))
		
		var _text = get("text")
		
		// should the placeholder be visible?
		placeholder_element.set("visible", (_text == ""))
		if (disable_placeholder_on_select and selected)
				placeholder_element.set("visible", false)
	}
	
	SUIInherit(self, props)
}