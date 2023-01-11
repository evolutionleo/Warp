function SUIBackButton(x = 20, y = 20, props = {}, children = []) : SUIButton(x, y, "back", undefined, props, children) constructor {
	onClick = function() { room_goto(rMenu) }
	w = 120
	h = 50
	
	SUILoadProps(props)
}