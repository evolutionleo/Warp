addHandler("chat msg", function(data) {
	//data.chat_id
	//data.message.profile_id
	//data.message.name
	//data.message.content
	trace(data)
})

addHandler("chat history", function(data) {
	trace(data.history)
})

addHandler("chats list", function(data) {
	var ids = data.chats
})

addHandler("chat info", function(data) {
	trace("chat info: %", data.chat)
})