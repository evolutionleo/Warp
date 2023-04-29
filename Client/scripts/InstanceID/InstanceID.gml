global.instance_uuids = {}

// put this in create event
function use_uuid() {
	if (!variable_instance_exists(self, "uuid")) {
		self.uuid = uuidv4_generate()
		self.remote = false // whether an entity is remote or local - local by default
	}
	
	global.instance_uuids[$ self.uuid] = id
}

function find_by_uuid(uuid, object_type = oEntity, remote = undefined) {
	return global.instance_uuids[$ uuid] ?? noone
}

function find_or_create(uuid, object_type, remote = undefined, props = {}) {
	var inst = find_by_uuid(uuid, object_type, remote)
	if !instance_exists(inst) {
		props.uuid = uuid
		inst = instance_create_layer(0, 0, "Instances", object_type, props)
		//inst.uuid = uuid
		if (!is_undefined(remote)) {
			inst.remote = remote
		}
	 }
	
	return inst
}



/// @func uuidv4_generate()
/// Credit - @TabularElf
function uuidv4_generate() {
	var _timeZone = date_get_timezone();
	date_set_timezone(timezone_utc);
	var _date = date_current_datetime();
	// Our statics
	static _epochTime = date_create_datetime(1971,1,1,1,1,1);
	var _second = get_timer() + round(date_second_span(_epochTime, _date)) * 10000;
	date_set_timezone(_timeZone);
	
	// Run the actual UUID
	var _uuid = array_create(32), _result, _string;
	
	for(var _i = 0; _i < array_length(_uuid); ++_i) {
		_result = (floor((_second + random(1) * 16)) % 16)+1;
		_string = string(ptr(_result));
		_uuid[_i] = string_copy(_string,string_length(_string),1);
	}
	var _i = 0;
	return _uuid[_i++] + _uuid[_i++] + _uuid[_i++] + _uuid[_i++] +
		_uuid[_i++] + _uuid[_i++] + _uuid[_i++] + _uuid[_i++] + "-" +
		_uuid[_i++] + _uuid[_i++] + _uuid[_i++] + _uuid[_i++] + "-" +
		_uuid[_i++] + _uuid[_i++] + _uuid[_i++] + _uuid[_i++] + "-" +
		_uuid[_i++] + _uuid[_i++] + _uuid[_i++] + _uuid[_i++] + "-" +
		_uuid[_i++] + _uuid[_i++] + _uuid[_i++] + _uuid[_i++] + 
		_uuid[_i++] + _uuid[_i++] + _uuid[_i++] + _uuid[_i++] + 
		_uuid[_i++] + _uuid[_i++] + _uuid[_i++] + _uuid[_i++];
}