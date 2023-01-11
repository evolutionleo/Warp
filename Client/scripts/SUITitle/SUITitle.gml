// <3
function SUITitle(x, y, text = "", props = {}, children = []) : SUIText(x, y, text, props, children) constructor {
	halign = fa_center
	valign = fa_middle
	font = fTitle
	
	SUILoadProps(props)
}