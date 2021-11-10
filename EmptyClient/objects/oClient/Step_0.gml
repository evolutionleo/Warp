/// @description Reconnect

if (!connected and !connecting) {
	trace("reconnecting...")
	connect()
}