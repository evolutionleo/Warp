// get the command line arguments
import trace from '#util/logging';
import chalk from 'chalk';
import minimist from 'minimist';
const args = minimist(process.argv.slice(2));

const common_config = {
    meta: {
        game_name: 'OnlineGame',
        version: 'v0.1',
        framework_version: 'v4.2',
        server: 'unknown'
    },

    lobby: {
        max_players: 100
    },

    timestamps_enabled: true, // there is a client-side config as well
    ws_enabled: true, // websocket server?

    tps: 60, // tickrate
    db_enabled: true,
    starting_room: 'Test Room',
    necessary_login: false,
    ping_interval: 5 * 1000,
    room_rest_timeout: 5    // (seconds) - prevents rooms from processing entities
                            // when no players are present for a certain amount of time
                            // set to -1 to disable this feature
}

const prod_config = {
    meta: {
        server: 'production'
    },
    env_name: 'prod',
    port: args.port || 1337,
    ws_port: args.ws_port || 3000,
    db: args.db || 'mongodb://127.0.0.1:27017/online-game', // by default it uses the same db for dev/prod, but
                                                             // you can add a postfix at the end of the name to separate them
    shell_enabled: false,
    verbose_lag: false,

    initial_lobbies: 3
}


const dev_config = {
    meta: {
        server: 'development'
    },
    env_name: 'dev',
    port: args.port || 1338,
    ws_port: args.ws_port || 3001,
    db: args.db || 'mongodb://127.0.0.1:27017/online-game',
    
    shell_enabled: true,
    verbose_lag: true,

    initial_lobbies: 1
}


type CONFIG = typeof common_config & typeof dev_config;

declare global {
    namespace NodeJS {
        interface Global {
            config: CONFIG;
        }
    }
}


const default_config = dev_config;
const env = args.env || 'dev'


const config:any = {};
Object.assign(config, common_config);

if (env === 'production' || env === 'prod' || args.prod) {
    Object.assign(config, prod_config);
}
else if (env === 'development' || env === 'dev' || args.dev) {
    Object.assign(config, dev_config);
}
else {
    Object.assign(config, default_config);
}


trace(chalk.blueBright('Config loaded! environment: ' + config.env_name));

global.config = config;
export default config;