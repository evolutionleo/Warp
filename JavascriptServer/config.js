// get the command line arguments
import { mergeDeep } from '#util/deep_merge';
import trace from '#util/logging';
import chalk from 'chalk';
import minimist from 'minimist';
const args = minimist(process.argv.slice(2));

/**
 * @typedef {Object} Config
 * @property {object} meta
 * @property {string} meta.game_name
 * @property {string} meta.game_version
 * @property {string} meta.warp_version
 * @property {string} meta.compatible_game_versions
 * @property {string} meta.server
 *
 * @property {Object} server
 * @property {number} server.max_connections
 * @property {number} server.max_ws_payload
 *
 * @property {object} lobby
 * @property {number} lobby.max_players
 * @property {boolean} lobby.addIntoPlayOnFull
 * @property {boolean} lobby.closeOnLeave
 *
 * @property {object} room
 * @property {string} room.rooms_path
 * @property {boolean} room.warn_on_unknown_entity
 * @property {string} room.starting_room
 * @property {number} room.rest_timeout
 *
 * @property {object} party
 * @property {number} party.max_members
 *
 * @property {number} tps
 *
 * @property {boolean} timestamps_enabled
 * @property {boolean} ws_enabled
 * @property {boolean} db_enabled
 * @property {boolean} shell_enabled
 * @property {boolean} rooms_enabled
 * @property {boolean} entities_enabled
 * @property {boolean} ssl_enabled
 * @property  {boolean} logging_enabled
 *
 * @property {string} ssl_cert_path
 * @property {string} ssl_key_path
 *
 * @property {string} env_name
 * @property {boolean} necessary_login
 * @property {boolean} verbose_lag
 *
 * @property {number} ping_interval
 * @property {number} mm_process_interval
 *
 * @property {string} db
 *
 * @property {string} ip
 * @property {number} port
 * @property {number} ws_port
 */

const common_config = {
    meta: {
        game_name: 'Warp Game',
        game_version: 'v1.0.0',
        warp_version: 'v5.0.0',
        
        compatible_game_versions: '>=1.0.0',
        
        server: 'unknown'
    },
    
    server: {
        max_connections: 1000,
        max_ws_payload: 2 * 1024 * 1024 // 2 MB
    },
    
    // some fundamental lobby settings
    lobby: {
        max_players: 100,
        addIntoPlayOnFull: false,
        // false - add them one by one immediately as they join
        closeOnLeave: false // close the lobby if a player leaves
    },
    
    room: {
        // .yy room loading
        rooms_path: '../Client/rooms',
        warn_on_unknown_entity: false,
        
        use_starting_room: true,
        use_last_profile_room: false,
        use_persistent_position: false,
        
        starting_room: 'Test Room',
        rest_timeout: 5,
        // when no players are present for a certain amount of time
        // set to -1 to disable this feature
        // (!!! setting to 0 might cause problems and unexpected behaviour !!!)
        
        recently_joined_timer: 2 // (seconds) - time 
    },
    
    party: {
        max_members: 5 // max party size
    },
    
    tps: 20,
    
    // Disable some of the features that you don't need in your game
    // true = enabled, false = disabled
    timestamps_enabled: true,
    ws_enabled: true,
    db_enabled: true,
    shell_enabled: false,
    rooms_enabled: true,
    entities_enabled: true,
    dt_enabled: true,
    ssl_enabled: false,
    logging_enabled: true,
    verbose_lag: false,
    
    necessary_login: false,
    
    ping_interval: 5 * 1000,
    mm_process_interval: 1 * 1000 // matchmaking: attempt to create new matches every X ms
};

const prod_config = {
    meta: {
        server: 'production'
    },
    env_name: 'prod',
    ip: '0.0.0.0',
    port: parseInt(args.port) || 1337,
    ws_port: parseInt(args.ws_port) || 3000,
    
    
    room: {
        rooms_path: './rooms'
    },
    
    ssl_enabled: false,
    ssl_cert_path: '/etc/letsencrypt/live/example.com/cert.pem',
    ssl_key_path: '/etc/letsencrypt/live/example.com/privkey.pem',
    
    db: args.db || 'mongodb://127.0.0.1:27017/warp-game',
    // you can add a postfix at the end of the name to separate them
    shell_enabled: false,
    verbose_lag: false,
    
    initial_lobbies: 3 // number of lobbies to create on start
};


const dev_config = {
    meta: {
        server: 'development'
    },
    env_name: 'dev',
    ip: '127.0.0.1',
    //ip: '192.168.1.1', // you can put your machine's local ip here for LAN play
    port: parseInt(args.port) || 1338,
    ws_port: parseInt(args.ws_port) || 3001,
    
    ssl_enabled: false,
    ssl_cert_path: '',
    ssl_key_path: '',
    
    db: args.db || 'mongodb://127.0.0.1:27017/warp-game',
    
    shell_enabled: true,
    verbose_lag: true,
    
    initial_lobbies: 3
};


const default_config = dev_config;
const env = args.env || 'dev';


/**
 * @type {Config}
 */
const config = mergeDeep({}, common_config);

if (env === 'production' || env === 'prod' || args.prod) {
    mergeDeep(config, prod_config);
}
else if (env === 'development' || env === 'dev' || args.dev) {
    mergeDeep(config, dev_config);
}
else {
    mergeDeep(config, default_config);
}


global.config = config;
export default config;

trace(chalk.blueBright('Config loaded! environment: ' + config.env_name));
