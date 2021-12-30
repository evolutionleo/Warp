// get the command line arguments
import trace from '#util/logging';
import chalk from 'chalk';
import minimist from 'minimist';
const args = minimist(process.argv.slice(2));

const common_config = {
    meta: {
        game_name: 'OnlineGame',
        version: 'v0.1',
        framework_version: 'v3.0',
        server: 'unknown'
    },

    lobby: {
        max_players: 100
    },

    timestamps_enabled: true, // there is a client-side config as well
    ws_enabled: true, // websocket server?

    tps: 60, // tickrate
    db_enabled: true,
    starting_room: 'Stress Test',
    necessary_login: false
}

const prod_config = {
    meta: {
        server: 'production'
    },
    env_name: 'prod',
    port: args.port || 1337,
    ws_port: args.port || 3000,
    db: args.db || 'mongodb://127.0.0.1:27017/online-game', // by default it uses the same db for dev/prod, but
                                                             // you can add a postfix at the end of the name to separate them
    shell_enabled: false
}


const dev_config = {
    meta: {
        server: 'development'
    },
    env_name: 'dev',
    port: args.port || 1338,
    ws_port: args.port || 3001,
    db: args.db || 'mongodb://127.0.0.1:27017/online-game',
    shell_enabled: true
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