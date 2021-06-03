// All the macro/config definitions go here

#macro GAME_VERSION "v0.1"

// These are config-dependant macros.
// Choose configs in GameMaker in the top-right corner


// Default (just mirrors debug)
#macro Default:IP "127.0.0.1"
#macro DEFAULT:PORT "1338"

// Production
#macro Prod:IP   "xxxxxx" // your external server IP
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