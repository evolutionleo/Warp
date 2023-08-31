// feather ignore all
function SUISprite(x, y, spr, img = 0, props = {}, children = []) : SUI_ELEMENT {
	self.spr = spr
	self.img = img

	self.blend = c_white
	self.alpha = 1.0
	self.angle = 0
	
	self.equal_scaling = false // xscale and yscale will always be equal
	
	w = sprite_get_width(spr)
	h = sprite_get_height(spr)
	
	SUIInherit(self, props)
	
	draw = function(x, y) {
		//var xoff = sprite_get_xoffset(spr)
		//var yoff = sprite_get_yoffset(spr)
		
		var sw = sprite_get_width(spr)
		var sh = sprite_get_height(spr)
		var xscale = get("w") / sw
		var yscale = get("h") / sh
		
		if (self.equal_scaling) {
			xscale = max(xscale, yscale)
			yscale = xscale
		}
		
		draw_sprite_ext(spr, img, x /*+ (xoff * xscale)*/, y /*+ (yoff * yscale)*/, xscale, yscale, angle, blend, alpha)
	}
}
