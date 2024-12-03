/// @desc

draw_set_halign(fa_center)
draw_set_valign(fa_middle)

for(var i = 0; i < array_length(global.lobbies); i++) {
	var lobby = global.lobbies[i]
	var lobby_string = string(i+1) + ")" + string({
		lobby_id: lobby.lobby_id,
		//level: lobby.level.name,
		//mode: lobby.level.mode,
		//room_name: lobby.level.room_name,
		players: string(lobby.player_count) + "/" + string(lobby.max_players),
		status: lobby.status
		//rooms: lobby.rooms
	})
	
	draw_text(room_width/2, 150 + i * 50, lobby_string)
}

draw_text(room_width/2, room_height/2+100, "Press buttons 1-9 to join lobbies\nL to leave\nR to refresh")

if (global.lobby) {
	draw_text(room_width/2, room_height-150, "joined lobby_id: " + global.lobby.lobby_id + "\n"
		+ "players: " + string(global.lobby.player_count) + "/"
		+ string(global.lobby.max_players))
	//draw_text(room_width/2, room_height-150,
	//	str_format("joined lobby_id: %\n players: %/%", global.lobby.lobby_id,
	//		global.lobby.player_count, global.lobby.max_players))
}
else {
	draw_text(room_width/2, room_height-150, "not joined a lobby")
}