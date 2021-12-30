// All the macro/config definitions go here

#macro GMOF_VERSION "v4.0.1"
#macro GAME_VERSION "v0.1"

trace("Welcome to GMOF % by Evoleo!", GMOF_VERSION)


// purges all entities from the room (so that there aren't any local duplicates when loading everything from the server)
// toggle this off if you have some specific case where you need to keep the entities that are in the room locally
#macro PURGE_ENTITIES_ON_ROOM_START true

// a value between 0 and 1 
#macro POS_INTERPOLATION .5
// instantly teleports if the distance is > than this
#macro POS_INTERP_THRESH 300

// makes GMOF ignore any older "entity" packets
// very useful for reducing jittering in real-time games
#macro TIMESTAMPS_ENABLED true


// Below are config-dependant macros.
// Choose configs in GameMaker in the top-right corner

// Default (just mirrors debug)
#macro Default:IP "127.0.0.1"
#macro Default:PORT "1338"

// Production
#macro Prod:IP   "xxx.xxx.xxx.xxx" // your external server IP
#macro Prod:PORT "1337"

// Debug/Development
#macro Dev:IP   "127.0.0.1"	// localhost
//#macro IP "192.168.1.224" // LAN (replace with your local IP)
#macro Dev:PORT "1338"


// warn about not setting the config (press the "target" icon)
#macro CONFIGS_SET true
#macro Default:CONFIGS_SET false
if (!CONFIGS_SET) {
	trace("Remember to set your config by pressing the 'target' icon in the top-right corner of IDE! (Dev = Development, Prod = Production)")
}


#macro CONNECT_TIMEOUT 60 * 5 // 5 seconds


// Allow up to 4000 ping (YYG recommends ~1000 for LAN-only games)
network_set_config(network_config_connect_timeout, 4000)


// This can be used to initiate the server interaction
// (send the first packet)
onConnect = function() {
	sendHello()
	sendHello2()
}

onDisconnect = function() {
	trace("Warning: Unhandled disconnect event!")
}


function leaveGame() {
	global.playing = false
	sendLeaveLobby()
	room_goto(rMenu)
}