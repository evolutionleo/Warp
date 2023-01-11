/// @desc

username = ""
password = ""

canvas = new SUICanvas()

txt_title = canvas.appendChild(new SUITitle(0, room_height/2 - 120, "Login"))
txt_title.set("center", room_width/2)

var tb_w = 192 * 1.5
var tb_h = 48 * 1.5
tb_login = canvas.appendChild(new SUITextInput(0, room_height/2-60, tb_w, tb_h, SUIBind("self.username", "self.username"), "username"))
tb_password = canvas.appendChild(new SUITextInput(0, room_height/2+30, tb_w, tb_h, SUIBind("self.password", "self.password"), "password"))


tb_password.text_element.text = SUIBind(function() { return string_repeat("*", string_length(self.password)) })

tb_login.set("center", room_width/2)
tb_password.set("center", room_width/2)

var _y = tb_password.get("bottom") + 20

var btn_w = 120
var btn_h = 40
btn_register = canvas.appendChild(new SUIButton(tb_login.get("left"), _y, "register", function() { sendRegister(username, password) }, {w: btn_w, h: btn_h}))
btn_login = canvas.appendChild(new SUIButton(0, _y, "log in", function() { sendLogin(username, password) }, {w: btn_w, h: btn_h}))

btn_login.set("right", tb_password.get("right"))