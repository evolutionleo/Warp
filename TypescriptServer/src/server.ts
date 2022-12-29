import './config.js';
import { createServer } from 'net';
const port = global.config.port;
const ip = global.config.ip;

import * as ws from 'ws';
const ws_port = global.config.ws_port;

import * as http from 'http';
import * as https from 'https';
const { ssl_enabled, ssl_key_path, ssl_cert_path } = global.config;

import * as fs from 'fs';

import trace from '#util/logging';
import packet from '#internal/packet';
import Client from '#concepts/client';
import { delayReceive } from '#util/artificial_delay';


import { dirname } from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

const __dirname = dirname(fileURLToPath(import.meta.url));


// load some init scripts (to not put everything in this file)
const init_files = fs.readdirSync(__dirname + '/internal/initializers', 'utf8');

// because sync/order matters
for(var i = 0; i < init_files.length; i++) {
    var file = init_files[i];
    trace(chalk.blueBright('loading initializer:', file));
    await import("file://" + __dirname + '/internal/initializers/' + file);
}
trace(chalk.blueBright('loaded initializers!'));


// "Welcome to Warp" message
let config = global.config;
trace(chalk.greenBright(`Welcome to Warp ${config.meta.warp_version}`));
trace(chalk.greenBright(`Running ${config.meta.game_name} ${config.meta.game_version} (compatible versions: ${config.meta.compatible_game_versions})`));


// The Actual Server
const server = createServer(function(socket) {
    trace(chalk.blueBright("Socket connected!"));
    
    var c = new Client(socket);
    global.clients.push(c); // add the client to clients list (unnecessary)
    
    // Bind functions on events

    socket.on('error', function(err) {
        if (err.message.includes('ECONNRESET')) { // this is a disconnect
            trace(chalk.redBright('Socket violently disconnected.'));
        }
        else {
            trace(chalk.redBright(`Error! ${err}`));
        }
    });
    
    // When data arrived
    socket.on('data', function(data) {
        // create artificial_delay
        if (delayReceive.enabled) {
            setTimeout(function() {
                packet.parse(c, data); // handle the logic
            }, delayReceive.get());
        }
        else { // just parse normally
            packet.parse(c, data); // handle the logic
        }
    });
    
    // When a socket/connection closed
    socket.on('close', function() {
        c.onDisconnect();
        global.clients.splice(global.clients.indexOf(c), 1);
        trace(chalk.red('Socket closed.'));
    })
});


server.listen(port, ip, () => {
    trace(chalk.bold.blueBright(`Server running on port ${port}!`));
});


// The WS Server
if (global.config.ws_enabled) {

let http_server: http.Server|https.Server;
if (ssl_enabled) {
    trace(chalk.blueBright('ssl enabled.'));
    http_server = https.createServer({
        key: fs.readFileSync(ssl_key_path).toString(),
        cert: fs.readFileSync(ssl_cert_path).toString()
    });
}
else {
    http_server = http.createServer({

    });
}

const ws_server = new ws.WebSocketServer({
    server: http_server,
});

ws_server.on('connection', (socket) => {
    trace(chalk.blueBright("WebSocket connected!"));

    var c = new Client(socket, 'ws');
    global.clients.push(c); // add the client to clients list (unnecessary)

    // Bind functions on events

    socket.on('error', function(err) {
        if (err.message.includes('ECONNRESET')) { // this is a disconnect
            trace(chalk.redBright('WebSocket violently disconnected.'));
            // handle disconnect here
        }

        trace(`Error! ${err}`);
    });
    
    // When data arrived
    socket.on('message', function(data) {
        // create artificial_delay
        if (delayReceive.enabled) {
            setTimeout(function() {
                packet.ws_parse(c, data as Buffer); // handle the logic
            }, delayReceive.get());
        }
        else { // just parse normally
            packet.ws_parse(c, data as Buffer); // handle the logic
        }
    });

    // When a socket/connection closed
    socket.on('close', function() {
        c.onDisconnect();
        global.clients.splice(global.clients.indexOf(c), 1);
        trace(chalk.yellowBright('WebSocket closed.'));
    });
});

ws_server.on('error', function (err) {
    console.log(chalk.yellowBright('WebSocket error: ' + err.message));
});

http_server.listen(ws_port, ip, function() {
    trace(chalk.bold.blueBright(`WebSocket Server running on port ${ws_port}!`));
});

}


export {}