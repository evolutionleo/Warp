// Please edit this file
import { Socket } from 'net';
import { Data, packet } from './networking'
import { clients } from './globals'

export function handlePacket(c: Client, data: Data):void {
	var cmd = data.cmd.toLowerCase();

	switch(cmd) {
		case 'hello':
			console.log("Hello from client: " + data.kappa);
			c.sendHello();
			break;
		case 'message':
			console.log('Message from client: ' + data.msg);
			c.sendMessage(data.msg + ' indeed');
			break;
		// Add your commands here:
        // case 'yourcommand':
        //     // some code
        //     break;
	}
}


export class Client {
	socket: Socket;
	username: string; // todo: implement actual usernames
	
    constructor(socket: Socket) {
		this.socket = socket;
        
        this.username = undefined;
        this.socket = socket;
        // you can add more variables here
    }

    // these 2 functions are internal,
	write(data: Data):void {
		this.socket.write(packet.build(data));
	}
	
    broadcastAll(data: Data):void {
        clients.forEach(c => {
			c.write(data);
        });
    }
    // you might want to implement a broadcastLobby() if you have those


	// Custom Wrappers
	sendHello():void {
		this.write({ cmd: 'hello', str: 'Hello, client' });
	}

	sendMessage(msg: string):void {
		this.write({ cmd: 'message', msg: msg });
	}
    // feel free to add more below


}