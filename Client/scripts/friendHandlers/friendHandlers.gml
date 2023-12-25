addHandler("friend list", function(data) {
	trace("friends:", data.friends)
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

addHandler("friend added", function(data) {
	trace("friend added!")
})

addHandler("friend req accepted", function(data) {
	trace("friend request from % accepted!", data.name)
})