const ping_interval = setInterval(() => {
    global.clients.forEach((c) => {
        c.sendPing();
    });
}, global.config.ping_interval);

global.start_time = new Date().getTime();
global.ping_interval = ping_interval;
export default ping_interval;
