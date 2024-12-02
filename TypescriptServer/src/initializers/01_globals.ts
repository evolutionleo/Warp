global.clients = [];

if (global.config.entities_enabled) {
    global.entities = [];
    global.entity_names = {};
    global.entity_objects = {};
}
global.lobbies = {};
global.parties = {};
global.chats = {};

global.cmd_validators = {};
global.packet_middleware = {};

global.maps = [];
global.levels = {};
global.game_modes = {};

export {};