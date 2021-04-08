import { Socket } from 'net'
import { encode, decode } from '@msgpack/msgpack'

export type Data = { [key: string]: string; };

export function handlePacket(c: Client, data: Data): void
{
	var cmd = data.cmd.toLowerCase();

	switch(cmd)
	{
		case 'hello':
			console.log("Hello from client: " + data.kappa);
			c.sendHello();
			break;
		case 'message':
			console.log('Message from client: ' + data.msg);
			c.sendMessage(data.msg + ' indeed');
			break;
		// Add your commands here:
	}
}

export class Client
{
	socket: Socket;
	username: string;
	
	//#region Necessary Functions
	
    constructor(socket: Socket)
	{
		this.socket = socket;
        
        this.username = undefined;
        this.socket = socket;
        // you can add more variables here
    }
    
	write(data: Data): void
	{
		this.socket.write(packet.build(data));
	}
	
    broadcastAll(data: Data, clients: Client[]): void
	{
        clients.forEach(
			c =>
			{
            	c.write(data);
        	}
		);
    }
	//#endregion
	
	//#region Wrappers
	sendHello(): void
	{
		this.write({ cmd: 'hello', str: 'Hello, client' });
	}

	sendMessage(msg: string): void
	{
		this.write({ cmd: 'message', msg: msg });
	}
	//#endregion
}

export let packet =
{
	build: (data: Data): Buffer =>
	{
        var dataBuff = encode(data);
        var sizeBuff = Buffer.alloc(2);
        sizeBuff.writeUInt16LE(dataBuff.length);

        var buff = Buffer.concat([sizeBuff, dataBuff], dataBuff.length + 2);
        return buff;
    },

	parse: (c: Client, data: any): void =>
	{
		var dataSize = data.length;
		for(var i = 0; i < dataSize;)
		{
			var packSize = data.readUInt16LE(i); // unpack the size
			i += 2;

			var dataPack = Buffer.alloc(packSize); // unpack the data
			data.copy(dataPack, 0, i, i + packSize);
			i += packSize;


			// pass the decoded data to handlePacket()
			handlePacket(c, decode(dataPack) as Data);
		}
	}
};