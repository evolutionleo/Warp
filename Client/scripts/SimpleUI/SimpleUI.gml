// feather disable GM1041
#macro SUI_VERSION "v0.1.1"
show_debug_message("[SUI] Welcome to SimpleUI " + SUI_VERSION + "!")

global.__SUIEmptyFunction = function() {}
#macro SUIEmptyFunction (global.__SUIEmptyFunction)

#macro SUIMouseX (device_mouse_x_to_gui(0))
#macro SUIMouseY (device_mouse_y_to_gui(0))

// if the mouse goes > this away from the border of a button, it will be "unclicked"
#macro SUI_CLICK_OFFSET 96


global.sui_canvases = []

function SUICanvas(children = []) constructor {
	__is_sui_element = false
	__element_type = "SUICanvas"
	
	visible = true
	enabled = true
	
	x = 0
	y = 0
	
	selected_element = undefined
	clicked_element = undefined
	prev_clicked_element = undefined
	hovered_element = undefined
	
	// assign the children
	self.children = children
	for(var i = 0; i < array_length(children); i++) {
		children[i].parent = self
	}
	
	select = function(element) {
		if (!is_undefined(selected_element))
			selected_element.selected = false
		
		selected_element = element
		element.selected = true
		element.onSelect()
	}
	
	///@param {String} name
	///@returns {Any} value
	get = function(name) { return variable_struct_get(self, name) }
	
	///@param {String} name
	///@param {Any} value
	///@returns {Undefined}
	set = function(name, value) { variable_struct_set(self, name, value) }
	
	forEach = function(func, arr = self.children, parent = self) {
		var l = array_length(arr)
		for(var i = 0; i < l; i++) {
			var element = arr[i]
			if (func(element, parent) != undefined)
				return;
			
			if (array_length(element.children) > 0)
				forEach(func, element.children, element)
		}
	}
	
	appendChild = function(element) {
		array_push(self.children, element)
		element.parent = self
		element.canvas = self
		element.init()
		return element
	}
	
	appendChildren = function(_children) {
		for(var i = 0; i < array_length(_children); i++) {
			appendChild(_children[i])
		}
	}
	
	calculateX = function(element, parent) {
		var _x = element.get("x")
		if (element.relative and !is_undefined(parent) and variable_struct_exists(parent, "parent")) // recursively add parent x
				_x += calculateX(parent, parent.parent)
		return _x
	}
	
	calculateY = function(element, parent) {
		var _y = element.get("y")
		if (element.relative and !is_undefined(parent) and variable_struct_exists(parent, "parent"))
			_y += calculateY(parent, parent.parent)
		return _y
	}
	
	draw = function() {
		if (!self.enabled) return;
		if (!self.visible) return;
		
		self.forEach(function(element, parent) {
			if (!element.visible) return undefined;
			
			var _x = calculateX(element, parent)
			var _y = calculateY(element, parent)
			element.predraw(_x, _y)
			element.draw(_x, _y)
			element.postdraw(_x, _y)
		})
	}
	
	handleClick = function() {
		hovered_element = undefined
		
		// reset everyone + find the top hovered element
		self.forEach(function(element) {
			with(element) {
				hovered = false
				clicked = false
				prev_clicked = false
				pressed = false
			
				if (hoverable and isHovered()) {
					other.hovered_element = self
				}
			}
		})
		
		
		
		if (!is_undefined(prev_clicked_element)) { // clicked something on this press, but then moved too far away
			// maybe we're back within click bounds?
			if (prev_clicked_element.distanceToMouse() < SUI_CLICK_OFFSET) {
				clicked_element = prev_clicked_element
				prev_clicked_element = undefined
			}
			else {
				prev_clicked_element.prev_clicked = true
			}
		}
		
		if (!is_undefined(clicked_element)) {
			// unclicked if we went too far away from the border
			if (clicked_element.distanceToMouse() > SUI_CLICK_OFFSET) {
				prev_clicked_element = clicked_element
				clicked_element = undefined
			}
			else {
				clicked_element.clicked = true
			}
		}
		
		if (!is_undefined(hovered_element)) // only hover if we're not currently clicking another element
			if (is_undefined(clicked_element) or hovered_element == clicked_element)
				hovered_element.hovered = true
		
		// start the click
		if (mouse_check_button_pressed(mb_left)) {
			if (hovered_element) {
				if (hovered_element.clickable) {
					clicked_element = hovered_element
					clicked_element.pressed = true
					clicked_element.onPress()
				}
			}
			else {
				if (!is_undefined(selected_element))
					selected_element.selected = false
				selected_element = undefined
			}
		}
		// do the click
		if (mouse_check_button_released(mb_left)) {
			if (!is_undefined(clicked_element)) {
				clicked_element.onClick()
				if (clicked_element.selectable)
					select(clicked_element)
			}
			
			clicked_element = undefined
			prev_clicked_element = undefined
		}
	}
	
	step = function() {
		if (!self.enabled) return;
		
		handleClick()
		
		self.forEach(function(element) {
			if (!element.enabled) return 1;
			element.step()
		})
	}
	
	
	deleteCanvas = function() {
		for(var i = 0; i < array_length(global.sui_canvases); i++) {
			if (global.sui_canvases[i] == self) {
				array_delete(global.sui_canvases, i, 1)
			}
		}
	}
	
	removeChild = function(element) {
		if (element == clicked_element)
			clicked_element = undefined
		if (element == prev_clicked_element)
			prev_clicked_element = undefined
		
		element.onRemove()
		
		for(var i = 0; i < array_length(self.children); i++) {
			if (self.children[i] == element) {
				array_delete(self.children, i, 1)
				break
			}
		}
	}
	
	
	// set everyone's canvas to this object
	self.forEach(function(element) {
		element.canvas = self
	})
	
	// now initialize everyone
	self.forEach(function(element) {
		element.init()
	})
	
	array_push(global.sui_canvases, self)
}

function SUIElement(x, y, props = {}, children = []) constructor {
	__is_sui_element = true
	__element_type = instanceof(self)
	
	canvas = undefined
	parent = undefined
	self.props = props
	self.children = [] // call appendChildren(children) later
	
	visible = true
	enabled = true
	relative = true
	
	selected = false // is the current selected element
	hovered = false // mouse hovered over
	pressed = false // just pressed this frame
	clicked = false // held down
	prev_clicked = false // clicked, but moved too far away
	
	// hoverable > clickable > selectable
	// (setting any of these to false will also automatically disable the depending ones)
	hoverable = true
	clickable = true
	selectable = true
	
	self.x = x
	self.y = y
	self.xstart = x
	self.ystart = y
	
	self.w = 0
	self.h = 0
	
	width = SUIBind("self.w", "self.w")
	height = SUIBind("self.h", "self.h")
	
	left = SUIBind(function() { return x }, function(new_left) { x = new_left })
	top = SUIBind(function() { return y }, function(new_top) { y = new_top })
	right = SUIBind(function() { return x + w }, function(new_right) { x = new_right - get("w") })
	bottom = SUIBind(function() { return y + h }, function(new_bottom) { y = new_bottom - get("h") })
	
	center = SUIBind(function() { return get("x") + get("w")/2 }, function(new_center) { x = new_center - get("w")/2 })
	middle = SUIBind(function() { return get("y") + get("h")/2 }, function(new_middle) { y = new_middle - get("h")/2 })
	
	
	getX = function() { return self.canvas.calculateX(self, self.parent) }
	getY = function() { return self.canvas.calculateY(self, self.parent) }
	
	
	///@function
	///@desc you should call this function at the end of your custom UI elements' constructor
	///@param {Struct} props
	///@self {SUIElement}
	function SUILoadProps(props) {
		SUIInherit(self, global.SUI_DEFAULT_PROPS)
		if (variable_struct_exists(global.SUI_DEFAULT_ELEMENT_PROPS, self.__element_type))
			SUIInherit(self, global.SUI_DEFAULT_ELEMENT_PROPS[$ self.__element_type])
		SUIInherit(self, props)
	}
	
	#region get/set
	
	///@param {String} prop_name
	///@param {Any} default_value
	///@returns {Any} value
	get = function(prop_name, default_value = undefined) {
		var value = variable_struct_get(self, prop_name)
		while (is_struct(value) and instanceof(value) == "SUIBinding") {
			value = value.get()
		}
		
		if (is_undefined(value))
			return default_value
		else return value
	}
	
	///@param {String} prop_name
	///@param {Any} value
	set = function(prop_name, value) {
		var old_value = variable_struct_get(self, prop_name)
		if(is_struct(old_value) and instanceof(old_value) == "SUIBinding") {
			old_value.set(value)
			return
		}
		variable_struct_set(self, prop_name, value)
	}
	
	#endregion
	
	appendChild = function(element) {
		array_push(self.children, element)
		element.parent = self
		element.canvas = self.canvas
		element.init()
		return element
	}
	
	appendChildren = function(_children) {
		for(var i = 0; i < array_length(_children); i++) {
			appendChild(_children[i])
		}
	}
	
	removeChild = function(element) {
		for(var i = 0; i < array_length(self.children); i++) {
			if (self.children[i] == element) {
				array_delete(self.children, i, 1)
				break
			}
		}
	}
	
	forEach = function(func, arr = self.children, parent = self) {
		var l = array_length(arr)
		for(var i = 0; i < l; i++) {
			var element = arr[i]
			if (func(element, parent) != undefined)
				return;
			
			if (array_length(element.children) > 0)
				forEach(func, element.children, element)
		}
	}
	
	isHovered = function() {
		var mx = SUIMouseX
		var my = SUIMouseY
		
		var _x = getX()
		var _y = getY()
		var _w = get("w")
		var _h = get("h")
		
		return point_in_rectangle(mx, my, _x, _y, _x + _w, _y + _h)
	}
	
	distanceToMouse = function() {
		var mx = SUIMouseX
		var my = SUIMouseY
		
		var left = self.get("left")
		var top = self.get("top")
		var right = self.get("right")
		var bottom = self.get("bottom")
		
		return SUIDistanceToRectangle(mx, my, left, top, right, bottom)
	}
	
	
	init = function() {}
	predraw = function(x, y) {}
	draw = function(x, y) {}
	postdraw = function(x, y) {}
	step = function() {}
	
	onMDown = function() {}
	onPress = function() {}
	onClick = function() {} // a.k.a. onRelease()
	onHover = function() {}
	onSelect = function() {}
	onRemove = function() {}
	
	
	// inherit everything
	SUIInherit(self, props)
	appendChildren(children)
}