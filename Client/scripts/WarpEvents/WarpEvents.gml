// This can be used to initiate the server interaction
// (send the first packet)
function onConnect() {
	sendHello()
	sendClientInfo()
	sendRequestTime()
	//sendNameGet()
	
	sendSession()
}

function onDisconnect() {
	trace("Warning: Unhandled disconnect event!")
}

function onIncompatible(server_game_version) {
	show_message(str_format("Incompatible client version - %! (Server version is %)", GAME_VERSION,  server_game_version))
	game_end()
}

// called when the current instance of the game is the dual instance (created by oDualInstance)
function onSecondWindow() {
	// you probably want to add some logic here to disable music, etc.
}

function onLobbyLeave(lobby, forced, reason) {
	if (room != rLobbiesList and room != rMenu)
		room_goto(rMenu)
}


function leaveGame() {
	global.playing = false
	sendLobbyLeave()
	room_goto(rMenu)
}