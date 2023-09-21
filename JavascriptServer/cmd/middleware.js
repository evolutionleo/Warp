
export function addMiddleware(cmd, cb) {
    let pm = global.packet_middleware;
    
    if (Array.isArray(cmd)) {
        for (let i = 0; i < cmd.length; i++) {
            addMiddleware(cmd[i], cb);
        }
    }
    else {
        if (pm[cmd] == undefined) {
            pm[cmd] = [];
        }
        
        pm[cmd].push(cb);
    }
}

export async function executeMiddleware(cmd, c, data) {
    let pm = global.packet_middleware[cmd];
    
    for (let i = 0; i < pm.length; i++) {
        let cb = pm[i];
        let result = cb(c, data);
        if (result instanceof Promise) {
            result = await result;
        }
        
        if (typeof result === 'boolean' && !result)
            return false;
    }
    return true;
}
