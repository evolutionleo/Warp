function sendPlayerControls() {
	send({
		cmd: "player controls",
		move: {
			x: move_x,
			y: move_y
		},
		kright: kright,
		kleft: kleft,
		kup: kup,
		kdown: kdown,
		
		kjump: kjump,
		kjump_rel: kjump_rel,
		kjump_press: kjump_press
	})
}