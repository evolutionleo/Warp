import Client from "#concepts/client";
import { Data } from "#cmd/handlePacket";

export type Middleware = (c:Client, data:Data) => void|Promise<void>|boolean|Promise<boolean>;

export function addMiddleware(cmd:string|string[], cb:Middleware) {
    let pm = global.packet_middleware;

    if (Array.isArray(cmd)) {
        for(let i = 0; i < cmd.length; i++) {
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

export async function executeMiddleware(cmd:string, c:Client, data:Data) {
    let pm = global.packet_middleware[cmd];

    for(let i = 0; i < pm.length; i++) {
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