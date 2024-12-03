function sendPlayerControls(inputs) {
	var data = { cmd: "player controls" }
	
	var input_names = variable_struct_get_names(inputs)
	for(var i = 0; i < variable_struct_names_count(inputs); i++) {
		var input_name = input_names[i]
		data[$ input_name] = self.inputs[input_name]
	}
	
	
	send(data)
}