const net = require('net');
const port = 1338;

require('./custom/handlePacket.js');
require('./static/clients.js'); // clients = []
require('./static/packet.js'); // packet = { parse(), build() }
require('./constructors/client.js'); // class Client {...}

const server = net.createServer(function(socket) {
    console.log("Socket connected!");
    
    var c = new Client(socket);
    c.username = ""; // todo: implement actual nicknames
    clients.push(c); // add the client to clients list (unnecessary)

    // Bind functions on events
    socket.on('error', function(err) {
        console.log(`Error! ${err}`); // Don't crash on error
    });
    
    socket.on('data', function(data) {
        packet.parse(c, data); // Do stuff
    });

    socket.on('end', function() {
        console.log('Socket ended.');
    })
});

server.listen(port);
console.log("Server running on port " + port + "!");