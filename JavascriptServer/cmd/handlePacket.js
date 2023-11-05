import trace from '#util/logging';
import chalk from 'chalk';
import { executeMiddleware } from '#cmd/middleware';

const packetHandlers = {};

/**
 * @param {string|string[]} cmd
 * @param {PacketHandler} cb
 */
export function addHandler(cmd, cb) {
    if (Array.isArray(cmd)) {
        for (const name of cmd) {
            addHandler(name, cb);
        }
    }
    else {
        packetHandlers[cmd] = cb;
    }
}
export default addHandler;



/**
 * @param {Client} c
 * @param {Data} data
 */
export async function handlePacket(c, data) {
    let cmd = data.cmd.toLowerCase();
    
    // Input validation
    if (global.config.validation_enabled) {
        let v = global.cmd_validators[cmd];
        if (typeof v === 'function') {
            let res = await v(data);
            if (res !== true) {
                c.sendInvalidInput(cmd, res);
                return;
            }
        }
    }
    
    if (global.config.middleware_enabled && global.packet_middleware[cmd]) {
        let res = await executeMiddleware(cmd, c, data);
        if (!res)
            return;
    }
    
    switch (cmd) {
        // ##############################################
        // You can add your commands either here directly, or inside cmd/handlers/
        
        case 'hello':
            trace('Hello from client: "' + data.greeting + '"');
            c.sendHello();
            break;
        case 'message':
            trace('Message from client: ' + data.msg);
            c.sendMessage(data.msg + ' indeed');
            break;
        
        default:
            let handler = packetHandlers[cmd];
            if (handler) {
                handler(c, data);
            }
            else {
                trace(chalk.yellowBright(`Warning! Unhandled cmd type: '${data.cmd}'`));
            }
            break;
    }
}
