import { createRequire } from 'module';
const require = createRequire(import.meta.url);

import './config.js';
import trace from '#internal/logging';
import { createServer } from 'net';
const port = global.config.port;

import * as fs from 'fs';

import packet from '#internal/packet';
import Client from '#entities/client';
import { delayReceive } from '#internal/artificial_delay';


import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));


// load some init scripts (to not put everything in this file)
const init_files = fs.readdirSync(__dirname + '/internal/initializers', 'utf8');
// init_files.forEach(function(file) {
//     import("file://" + __dirname + '/internal/initializers/' + file);
// })


// because sync/order matters
for(var i = 0; i < init_files.length; i++) {
    var file = init_files[i];
    await import("file://" + __dirname + '/internal/initializers/' + file);
    trace('loading initializer:' + file);
}
trace('loaded initializers!');


// The Actual Server
const server = createServer(function(socket) {
    trace("Socket connected!");
    
    var c = new Client(socket);
    global.clients.push(c); // add the client to clients list (unnecessary)
    
    // Bind functions on events
    
    socket.on('error', function(err) {
        if (err.message.includes('ECONNRESET')) { // this is a disconnect
            trace('Socket violently disconnected.');
            // handle disconnect here
        }
        
        trace(`Error! ${err}`);
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
        trace('Socket closed.');
    })
});

server.listen(port);
trace("Server running on port " + port + "!");


export {}