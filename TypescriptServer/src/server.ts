import * as net from 'net';

const port = 1338;

import { Client, handlePacket } from './custom_stuff'
import { Data, packet } from './networking';
import { clients } from './globals';

const server = net.createServer(socket => {
	console.log("Socket connected!");
	
	var c = new Client(socket);
	c.username = ""; // todo: implement actual nicknames
	
	clients.push(c); // unnecessary, but useful if you want to iterate over all clients

	// Bind functions on events
	socket.on('error', (err) => {
		console.log(`Error! ${err}`); // Don't crash the server on error
	});
	
	socket.on('data', (data) => {
		packet.parse(c, data); // Handle data
	});

	socket.on('end', () => {
		console.log('Socket ended.');
	});
});

server.listen(port);
console.log("Server running on port " + port + "!");