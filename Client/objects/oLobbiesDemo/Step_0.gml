/// @desc Press 1-9 to join lobbies


for(var i = 1; i <= 9; i++) {
	if (keyboard_check_pressed(ord(string(i)))) {
		trace("pressed %", i)
		if (i-1 < array_length(global.lobbies)) {
			sendLobbyJoin(global.lobbies[i-1].lobby_id)
		}
	}
}

if (keyboard_check_pressed(ord("L"))) {
	sendLobbyLeave()
}

if (keyboard_check_pressed(ord("R"))) {
	sendLobbyRequestList()
}