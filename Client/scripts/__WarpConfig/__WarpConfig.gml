// All the macro/config definitions go here

#macro WARP_VERSION "v5.0.0"
#macro GAME_VERSION "v1.0.0"

trace("Welcome to Warp % by Evoleo!", WARP_VERSION)



network_set_config(network_config_use_non_blocking_socket, true)

#macro ALLOW_UKNOWN_ENTITIES true

// purges all entities from the room (so that there aren't any local duplicates when loading everything from the server)
// toggle this off if you have some specific case where you need to keep the entities that are in the room locally
#macro PURGE_ENTITIES_ON_ROOM_START true

// instantly teleports if an entity has moved > than this on a single axis in a single tick
#macro POS_INTERP_THRESH 100

#macro TIMESTAMPS_ENABLED true

// offset in ms, a buffer between server and client time to allow for network latency & inconsistency
global.server_time_delay = 100
#macro SERVER_TIME_DELAY global.server_time_delay
// if set to true, global.server_time_delay will automatically increase when lag spikes occur
#macro AUTOADJUST_SERVER_DELAY true


#macro SOCKET_TYPE SOCKET_TYPES.WS

enum SOCKET_TYPES {
	TCP = network_socket_tcp,
	WS = network_socket_ws,
	WSS = network_socket_wss
}

// Below are config-dependant macros.
// Choose configs in GameMaker in the top-right corner

// Default (just mirrors debug)
#macro Default:IP "127.0.0.1"
#macro Default:PORT "1338"
#macro Default:WS_PORT "3001"
#macro Default:DUAL_INSTANCE true
#macro Default:DUAL_INSTANCE_COUNT 1

// Production
//#macro Prod:IP   "xxx.xxx.xxx.xxx" // your external server IP
#macro Prod:IP   "195.2.80.50" // your external server IP
#macro Prod:PORT "1337"
#macro Prod:WS_PORT "3000"
#macro Prod:DUAL_INSTANCE true
//#macro Prod:DUAL_INSTANCE false
#macro Prod:DUAL_INSTANCE_COUNT 1

// Debug/Development
#macro Dev:IP   "127.0.0.1"	// localhost
//#macro IP "192.168.1.1" // LAN (replace with your local IP)
#macro Dev:PORT "1338"
#macro Dev:WS_PORT "3001"
#macro Dev:DUAL_INSTANCE true
#macro Dev:DUAL_INSTANCE_COUNT 2


// warn about not setting the config (press the "target" icon in the top-right corner of IDE)
#macro CONFIGS_SET true
#macro Default:CONFIGS_SET false
if (!CONFIGS_SET) {
	trace("")
	trace("### Remember to set your config by pressing the 'target' icon in the top-right corner of IDE! (Dev = Development, Prod = Production) ###")
	trace("")
}


#macro CONNECT_TIMEOUT 60 * 5 // 5 seconds


// Allow up to 4000 ping (YYG recommends ~1000 for LAN-only games)
network_set_config(network_config_connect_timeout, 4000)