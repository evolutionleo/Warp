function sendFriendsGet() {
	send({ cmd: "friend list" })
}

function sendFriendRequestSend(name) {
	send({ cmd: "friend req send", name })
}

function sendFriendRequestAccept(name) {
	send({ cmd: "friend req accept", name })
}

function sendFriendRequestReject(name) {
	send({ cmd: "friend req reject", name })
}

function sendFriendRequestsGetIncoming() {
	send({ cmd: "friend req inc" })
}

function sendFriendRequestsGetOutgoing() {
	send({ cmd: "friend req out" })
}