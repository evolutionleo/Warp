/// @desc

global.canvas = new SUICanvas()

var btn_w = 192
var btn_h = 64
var offset_y = 10

txt_title = global.canvas.appendChild(new SUITitle(0, 90, "Warp Demo"))
txt_title.set("center", room_width/2)


btn_mm = global.canvas.appendChild(new SUIButton(0, room_height/2-(btn_h+offset_y)/2, "Find Match", function() { room_goto(rFindingMatch) }, {w: btn_w, h: btn_h}))
btn_lobbies = global.canvas.appendChild(new SUIButton(0, room_height/2+(btn_h+offset_y)/2, "Lobbies", function() { room_goto(rLobbiesList) }, {w: btn_w, h: btn_h}))
btn_login = global.canvas.appendChild(new SUIButton(0, room_height/2+(btn_h+offset_y)/2+(btn_h+offset_y), "Login", function() { room_goto(rLogin) }, {w: btn_w, h: btn_h}))

btn_mm.set("center", room_width/2)
btn_lobbies.set("center", room_width/2)
btn_login.set("center", room_width/2)