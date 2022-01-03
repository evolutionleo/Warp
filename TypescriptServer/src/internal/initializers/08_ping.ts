const ping_interval = setInterval(() => {
    global.clients.forEach((c) => {
        // trace('ping: ' + c.ping + 'ms');
        c.sendPing();
    })
}, global.config.ping_interval);

global.ping_interval = ping_interval;
export default ping_interval;