/// @desc sendPing()

sendPing()

var game_speed = game_get_speed(gamespeed_fps)

// 1 second
ping_interval = game_speed
// 10 seconds
ping_timeout = game_speed * 10
alarm[0] = ping_interval
alarm[1] = ping_timeout