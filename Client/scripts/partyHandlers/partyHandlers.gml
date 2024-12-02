addHandler("party info", function(data) {
	global.party = data.party
})

addHandler("party join", function(data) {
	global.party = data.party
	show_message_async("you joined a party!")
})

addHandler("party reject", function(data) {
	var p = data.party
	var reason = data.reason
	show_message_async("unable to join the party")
})

addHandler("party invite", function(data) {
	var p = data.party
	
	show_message_async($"incoming party invite. party_id: {p.party_id}")
	
	var cb = method({p}, function(inv) { return inv.party_id == p.party_id })
	var invite_exists = !array_any(global.party_invites, cb)
	if(!invite_exists)
		array_push(global.party_invites, p)
})

addHandler("party invite sent", function(data) {
	var name = data.to
	show_message_async($"party invite sent to {name}")
})

addHandler("party leave", function(data) {
	var p = data.party
	var reason = data.reason
	var forced = data.reason
	
	global.party = undefined
	show_message_async($"you {forced ? "left" : "were kicked from"} the party. reason: {reason}")
})