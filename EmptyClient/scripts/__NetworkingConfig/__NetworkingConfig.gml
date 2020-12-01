// All the macro definitions go here

// Production
//#macro IP   "xxxxxx"
//#macro PORT "1337"

// Debug
#macro IP   "127.0.0.1" // localhost
#macro PORT "1338"

// Allow up to 4000 ping (YYG recommends ~1000 for LAN-only games)
network_set_config(network_config_connect_timeout, 4000)