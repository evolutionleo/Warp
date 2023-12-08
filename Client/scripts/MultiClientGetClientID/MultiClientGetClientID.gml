/// @func MultiClientGetID
/// @return {Real}
/// feather ignore all 
function MultiClientGetID(){
	/// feather ignore all 
	static _num = undefined;
	if (_num == undefined) {
		_num = -1;
		if (GM_build_type == "run") {
			var _i = 0;
			var _is_browser = (os_browser != browser_not_a_browser) || (os_type == os_gxgames);
			if (_is_browser) {
				// Force num to be 0 instead
				_num = 0;
				repeat(parameter_count()+1) {
					var _param = __MultiClientParseString(parameter_string(_i));
					if (_param != undefined) {
						if (_param[0] == "mc-window-number") {
							_num = real(_param[1]);
							break;
						}
					}
					++_i;
				}
			} else {
				repeat(parameter_count()) {
					if (parameter_string(_i) == "mc-window-number") {
						_num = real(parameter_string(_i+1))-1;
						break;
					}
					++_i;
				}
			}
		}
	}
	
	return _num;
}

/// @ignore
function __MultiClientParseString(_str) {
	/// feather ignore all 
	var _equalPos = string_pos("=", _str);
	if (_equalPos != 0) {
		var _returnStr = [];
		 _returnStr[0] = string_delete(_str, _equalPos, string_length(_str) - _equalPos + 1);
		 _returnStr[1] = string_delete(_str, 1, _equalPos);	
		 return _returnStr;
	}
	
	return undefined;
}