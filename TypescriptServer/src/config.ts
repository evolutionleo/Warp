// get the command line arguments
import minimist from 'minimist';
const args = minimist(process.argv.slice(2));

const common_config = {
    meta: {
        game_name: 'online game',
        version: 'v0.1',
        framework_version: 'v3.0',
        server: 'unknown'
    },

    tps: 30,
    db_enabled: true
}

const prod_config = {
    meta: {
        server: 'production'
    },
    env_name: 'prod',
    port: args.port || 1337,
    db: args.db || 'mongodb://127.0.0.1:27017/oniline-game'
}


const dev_config = {
    meta: {
        server: 'development'
    },
    env_name: 'dev',
    port: args.port || 1338,
    db: args.db || 'mongodb://127.0.0.1:27017/online-game'
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


console.log('Config loaded! environment: ' + config.env_name);

global.config = config;
export default config;