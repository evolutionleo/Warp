const common_config = {
    tickrate: 60
}

const dev_config = {
    server_ip: "127.0.0.1",
    server_port: 3001,
    ssl_enabled: false
}

const prod_config = {
    server_ip: "xxxx",
    server_port: 3000, // the WebSocket port
    ssl_enabled: true
}


const SELECTED_CONFIG = 'DEV'; // change this to swap between the configs
// const SELECTED_CONFIG = 'PROD';

const selected_config = SELECTED_CONFIG == 'DEV' ? dev_config : prod_config;
const config = Object.assign({}, common_config, selected_config);

window.config = config;
// export default config;