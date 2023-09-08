/// @desc
// feather ignore GM1041

username = ""
password = ""
global.login_status = ""
global.login_result = ""

global.canvas = new SUICanvas()

global.canvas.appendChild(new SUIBackButton())

txt_title = global.canvas.appendChild(new SUITitle(0, room_height/2 - 120, "Login"))
txt_title.set("center", room_width/2)

txt_status = global.canvas.appendChild(new SUIText(0, 100, SUIBind("global.login_result"), { halign: fa_center }))
txt_status.set("center", room_width/2)

var tb_w = 192 * 1.5
var tb_h = 48 * 1.5
tb_login = global.canvas.appendChild(new SUITextInput(0, room_height/2-60, tb_w, tb_h, SUIBind("self.username", "self.username"), "username"))
tb_password = global.canvas.appendChild(new SUITextInput(0, room_height/2+30, tb_w, tb_h, SUIBind("self.password", "self.password"), "password"))


tb_password.text_element.text = SUIBind(function() { return string_repeat("*", string_length(self.password)) })

tb_login.set("center", room_width/2)
tb_password.set("center", room_width/2)

var _y = tb_password.get("bottom") + 20

var btn_w = 120
var btn_h = 40
btn_register = global.canvas.appendChild(new SUIButton(tb_login.get("left"), _y, "register", function() { sendRegister(username, password) }, {w: btn_w, h: btn_h}))
btn_login = global.canvas.appendChild(new SUIButton(0, _y, "log in", function() { sendLogin(username, password) }, {w: btn_w, h: btn_h}))

btn_login.set("right", tb_password.get("right"))