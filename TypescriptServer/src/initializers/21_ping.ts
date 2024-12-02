import trace from "#util/logging";
import chalk from "chalk";

const ping_interval = setInterval(() => {
    global.clients.forEach((c) => {
        c.sendPing();
        
        if (!c.connected) {
            c.reconnect_timer -= global.config.ping_interval;
            if (c.reconnect_timer < 0) {
                trace(chalk.yellowBright("Client timed out."));
                c.destroy();
            }
        }
    })
}, global.config.ping_interval);

global.start_time = new Date().getTime();
global.ping_interval = ping_interval;
export default ping_interval;