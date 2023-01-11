// these will be applied to every UI element in the game
global.SUI_DEFAULT_PROPS = {
	
}

// Here you can set element-specific defaults
global.SUI_DEFAULT_ELEMENT_PROPS = {
	//SUIText: {
	//	 color: c_lime,
	//	 alpha: 0.5
	//},
	//SUITextBox: {
		
	//}
	// ...
}

// you should call this function at the end of your custom UI elements' constructor
function SUILoadProps(props) {
	SUIInherit(self, global.SUI_DEFAULT_PROPS)
	if (variable_struct_exists(global.SUI_DEFAULT_ELEMENT_PROPS, self.__element_type))
		SUIInherit(self, global.SUI_DEFAULT_ELEMENT_PROPS[$ self.__element_type])
	SUIInherit(self, props)
}