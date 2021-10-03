require('./internal/logging.js'); // trace()
require('./config.js');

const net = require('net');
const port = config.port;

const ws = require('ws');
const ws_port = config.ws_port;

const fs = require('fs');

const packet = require('./internal/packet.js'); // { build(), parse() }
const Client = require('./internal/concepts/client.js'); // class Client {...}
const { delayReceive } = require('./internal/artificial_delay.js');


// load some init scripts (to not put everything in this file)
const init_files = fs.readdirSync(__dirname + '/internal/initializers', 'utf8');
init_files.forEach(function(file) {
    require(__dirname + '/internal/initializers/' + file);
})
trace('loaded initializers!');


// The TCP Server
const server = net.createServer(function(socket) {
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
    });
});

// The WS Server
const ws_server = new ws.Server({
    host: 'localhost',
    port: config.ws_port
}, function() {
    trace('WebSocket Server running on port ' + ws_port + '!');
});

ws_server.on('connection', (socket) => {
    trace("WebSocket connected!");

    var c = new Client(socket, 'ws');
    global.clients.push(c); // add the client to clients list (unnecessary)

    // Bind functions on events

    socket.on('error', function(err) {
        if (err.message.includes('ECONNRESET')) { // this is a disconnect
            trace('WebSocket violently disconnected.');
            // handle disconnect here
        }

        trace(`Error! ${err}`);
    });
    
    // When data arrived
    socket.on('message', function(data) {
        // create artificial_delay
        if (delayReceive.enabled) {
            setTimeout(function() {
                packet.ws_parse(c, data); // handle the logic
            }, delayReceive.get());
        }
        else { // just parse normally
            packet.ws_parse(c, data); // handle the logic
        }
    });

    // When a socket/connection closed
    socket.on('close', function() {
        c.onDisconnect();
        trace('Socket closed.');
    });
});


server.listen(port);
trace("Server running on port " + port + "!");