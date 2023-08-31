/// @desc

draw_set_halign(fa_center)
draw_set_valign(fa_middle)

for(var i = 0; i < array_length(global.lobbies); i++) {
	var lobby = global.lobbies[i]
	var lobby_string = string(i+1) + ")" + string({
		lobbyid: lobby.lobbyid,
		//level: lobby.level.name,
		//mode: lobby.level.mode,
		//room_name: lobby.level.room_name,
		players: string(lobby.player_count) + "/" + string(lobby.max_players),
		//rooms: lobby.rooms
	})
	
	draw_text(room_width/2, 150 + i * 50, lobby_string)
}

draw_text(room_width/2, room_height/2+100, "Press buttons 1-9 to join lobbies\nL to leave")

if (global.lobby) {
	draw_text(room_width/2, room_height-150, "joined lobbyid: " + global.lobby.lobbyid + "\n"
		+ "players: " + string(global.lobby.player_count) + "/"
		+ string(global.lobby.max_players))
	//draw_text(room_width/2, room_height-150,
	//	str_format("joined lobbyid: %\n players: %/%", global.lobby.lobbyid,
	//		global.lobby.player_count, global.lobby.max_players))
}
else {
	draw_text(room_width/2, room_height-150, "not joined a lobby")
}