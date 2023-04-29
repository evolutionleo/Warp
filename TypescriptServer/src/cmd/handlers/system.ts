import { addHandler } from "#cmd/handlePacket";
import trace from "#util/logging";
import semver from "semver";
import chalk from "chalk";
import { Socket as TCPSocket } from 'net';
import { WebSocket as WSSocket } from 'ws';


addHandler('client info', (c, data) => { 
    let info = data;
    delete info.cmd;
    trace('info about client: ' + JSON.stringify(info));

    const client_game_version = data.game_version;
    const client_warp_version = data.warp_version;
    const compatible_versions = global.config.meta.compatible_game_versions
    const warp_version = global.config.meta.warp_version;

    const warp_version_match = semver.cmp(client_warp_version, '=', warp_version);
    const version_compatible = semver.satisfies(client_game_version, compatible_versions);

    const compatible = warp_version_match && version_compatible;

    c.sendServerInfo(compatible);
    
    // not compatible - disconnect the client
    if (!compatible) {
        trace(chalk.yellowBright(`Kicking incompatible client! (client version ${client_game_version}, server version ${global.config.meta.game_version})`));

        // immediately close the socket after 1 last packet
        setImmediate(() => {
            // close the socket
            if (c.type == 'tcp') {
                const s = c.socket as TCPSocket;
                s.destroy();
            }
            else {
                const s = c.socket as WSSocket;
                s.close();
            }
        });
    }
});


addHandler('ping', (c, data) => {
    c.sendPong(data.T);
});

addHandler('pong', (c, data) => {
    let t = data.T;
    let new_t = new Date().getTime();
    let dt = new_t - t - global.start_time;

    c.ping = dt;

    // c.sendPing(); // send ping again
    // jk don't send ping again that's a memory leak
});

addHandler('server timestamp', (c, data) => {
    c.sendServerTime(data.t);
});
