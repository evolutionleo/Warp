addHandler("friend list", function(data) {
	trace(data.friends)
	global.friends = data.friends
})

addHandler("friend req inc", function(data) {
	trace(data.from)
	global.friend_requests_inc = data.from
})

addHandler("friend req out", function(data) {
	trace(data.to)
	global.friend_requests_out = data.to
})

addHandler("friend req new", function(data) {
	trace(data.from)
	array_push(global.friend_requests_inc, data.from)
})