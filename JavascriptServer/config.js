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
 * @property {boolean} lobby.add_into_play_on_full
 * @property {boolean} lobby.add_into_play_on_join
 * @property {boolean} lobby.close_on_leave
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
 * @property {object} matchmaking
 * @property {number} matchmaking.mmr_starting
 * @property {number} matchmaking.mmr_min
 * @property {number} matchmaking.mmr_scale
 * @property {number} matchmaking.mmr_max_gain
 * @property {number} matchmaking.mmr_max_difference
 * @property {number} matchmaking.process_interval
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
 * @property {boolean} logging_enabled
 * @property {boolean} validation_enabled
 * @property {boolean} middleware_enabled
 * @property {boolean} matchmaking_enabled
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
        warp_version: 'v7.0.0',
        
        compatible_game_versions: '>=1.0.0',
        
        server: 'unknown'
    },
    
    server: {
        max_connections: 1000,
        max_ws_payload: 2 * 1024 * 1024 // 2 MB
    },
    
    // some fundamental lobby settings
    lobby: {
        max_players: 100, // used when creating a lobby with no map/game mode
        add_into_play_on_full: true,    // true - add all the players into play at the same time once the lobby is filled,
        add_into_play_on_join: false, // true - add players one by one immediately as they join a lobby
        allow_join_by_id: false,
        close_on_leave: true // close the lobby if a player leaves
    },
    
    room: {
        // .yy room loading
        rooms_path: '../Client/rooms', // (overriden in prod config)
        warn_on_unknown_entity: false,
        
        use_starting_room: true, // join config.room.starting_room on start
        use_last_profile_room: false, // join client.profile.state.room on start if logged in
        use_persistent_position: false, // load the last x/y from the profile on room join and save them on room leave
        
        starting_room: 'Test Room',
        rest_timeout: 5,    // (seconds) - prevents rooms from processing entities
        // when no players are present for a certain amount of time
        // set to -1 to disable this feature
        // (!!! setting to 0 might cause problems and unexpected behaviour !!!)
        
        recently_joined_timer: 2 // (seconds) - time after a client joins to receive ALL entity data
    },
    
    party: {
        max_members: 5, // max party size
        leader_only_mm: false // true - only party leader can start matchmaking
    },
    
    matchmaking: {
        mmr_starting: 1000, // the starting mmr given to new players
        mmr_min: 1, // can't go below this
        
        mmr_scale: 1000, // lower number = less effect opponent's mmr has on mmr change
        // (chess uses 400, meaning a player with 400 mmr more is on average 10x more likely to win)
        mmr_max_gain: 50, // the maximum possible amount of mmr that a player can gain after a single game, winning against an equal opponent will give half of this
        mmr_max_difference: 500, // can't ever register a ranked match with players' mmr difference more than this
        
        process_interval: 1 * 1000 // matchmaking: attempt to create new matches every X ms
    },
    
    db: {
        path: 'mongodb://127.0.0.1:27017/',
        name: 'warp-game' // by default it uses the same db name for dev/prod, but you can use separate ones
    },
    
    login: {
        kick_other_sessions: true
    },
    
    tps: 20, // tickrate
    
    // Disable some of the features that you don't need in your game
    // true = enabled, false = disabled
    timestamps_enabled: true, // send timestamps with each packet (there is a client-side config as well)
    ws_enabled: true, // websocket server?
    db_enabled: true, // MongoDB support
    shell_enabled: false, // toggles a console that allows code execution while running the game (better to change this in prod/dev configs rather than here)
    rooms_enabled: true, // toggles lobbies being split into rooms (sub-lobbies with entities)
    entities_enabled: true, // toggles loading/spawning entities
    dt_enabled: true, // toggles delta time for entity physics
    ssl_enabled: false, // SSL support. false by default (best set in the prod/dev configs)
    logging_enabled: true, // whether or not to log trace()'d messages to server_log.txt
    validation_enabled: true, // validate the incoming commands using ValidatorJS's validators
    middleware_enabled: true, // middleware to execute before some packets are handled
    matchmaking_enabled: true, // use the matchmaking system with queues and tickets
    
    verbose_lag: false, // logs warning messages to chat when a game tick is taking longer than expected
    
    necessary_login: false, // if true, won't allow a client to join any lobby before logging in
    
    ping_interval: 5 * 1000,
    reconnect_timeout: 15 * 1000 // keep a "dead" client in all the lobbies after socket disconnecting, waiting to reconnect with the same account
};

const prod_config = {
    meta: {
        server: 'production'
    },
    env_name: 'prod',
    ip: '0.0.0.0', // you need to replace this with your domain if using ssl for it to work
    port: parseInt(args.port) || 1337,
    ws_port: parseInt(args.ws_port) || 3000,
    
    
    room: {
        rooms_path: './rooms'
    },
    
    ssl_enabled: false,
    ssl_cert_path: '/etc/letsencrypt/live/example.com/cert.pem',
    ssl_key_path: '/etc/letsencrypt/live/example.com/privkey.pem',
    
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
