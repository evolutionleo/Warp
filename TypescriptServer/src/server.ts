import * as net from 'net';

const port = 1338;

// Unnecessary complexity
//import { handlePacket } from './custom/handlePacket';
//import { Clients } from './static/clients'; 
//import { packet } from './static/packet'; // packet = { parse(), build() }
import { Client, Data, handlePacket, packet } from './networking'; // class Client {...}

let clients: Client[] = []; //No need for a single file

const server = net.createServer(
	socket =>
	{
		console.log("Socket connected!");
		
		var c = new Client(socket);
		c.username = ""; // todo: implement actual nicknames
		
		clients.push(c); // add the client to clients list (unnecessary)

		// Bind functions on events
		socket.on('error',
			err =>
			{
				console.log(`Error! ${err}`); // Don't crash on error
			}
		);
		
		socket.on('data', 
			data =>
			{
				packet.parse(c, data); // Do stuff
			}
		);

		socket.on('end',
			() =>
			{
				console.log('Socket ended.');
			}
		);
	}
);

server.listen(port);
console.log("Server running on port " + port + "!");