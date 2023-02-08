/// @func   unix_timestamp(datetime)
/// @desc   Returns a Unix timestamp for the current or given GameMaker datetime.
/// @param  {datetime}  datetime    date-time value (default current time)
/// @return {real}      Unix timestamp
/// GMLscripts.com/license
 
function unix_timestamp(datetime = date_current_datetime()) {
	var epoch = floor(date_create_datetime(1970, 1, 1, 0, 0, 0))
	return floor(date_second_span(epoch, datetime))
}