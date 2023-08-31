// feather disable GM1041

///@function SUIBind(_get, _set)
///@param {Function|String} _get
///@param {Function|String} _set
function SUIBind(_get = SUIEmptyFunction, _set = SUIEmptyFunction) {
	// get = "global.something" or get = "oPlayer.username"
	if is_string(_get) {
		var split = string_split(_get, ".", false, 1)
		var source = split[0]
		if (array_length(split) > 1)
			var name = split[1]
		else
			name = ""
		
		if (source == "global")
			source = global
		else if (asset_get_index(source) != -1) {
			source = asset_get_index(source)
		}
		else if name == "" { // no ".", only 1 word
			name = source
			source = global
		}
		else if (source == "self" or source == "this") {
			source = self
		}
		else if (source == "mouse") {	} // mouse.x/mouse.y are handled below
		else {
			source = self
		}
		
		// mouse.x and mouse.y are special
		if (source == "mouse") {
			if (name == "x") _get = function() { return SUIMouseX }
			else if (name == "y") _get = function() { return SUIMouseY }
			else _get = SUIEmptyFunction // not x nor y
		}
		else {
			_get = SUIGetter(source, name)
		}
	}
	
	if is_string(_set) {
		var split = string_split(_set, ".", false, 1)
		var source = split[0]
		if (array_length(split) > 1)
			var name = split[1]
		else
			name = ""
		
		if (source == "global")
			source = global
		else if (asset_get_index(source) != -1) {
			source = asset_get_index(source)
		}
		else if name == "" {
			name = source
			source = self
		}
		else if (source == "self" or source == "this") {
			source = self
		}
		else {
			source = other
		}
		
		_set = SUISetter(source, name)
	}
	
	return new SUIBinding(_get, _set)
}

function SUIBinding(_get, _set) constructor {
	self.get = _get
	self.set = _set
}

function SUIGetter(source, name) {
	return method({source: source, name: name}, function() {
		return SUIVarGet(source, name)
	})
}

function SUISetter(source, name) {
	return method({source: source, name: name}, function(value) {
		return SUIVarSet(source, name, value)
	})
}
