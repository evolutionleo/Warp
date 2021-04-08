// this file contains internal things that you shouldn't touch (unless you know what you're doing)
import { Socket } from 'net'
import { Client, handlePacket } from './custom_stuff'
import { encode, decode } from '@msgpack/msgpack'

// theoretically you can make it any type, but anything other than a map makes little sense
export type Data = { [key: string]: any; cmd: string; };

export let packet = {
	build: function(data: Data):Buffer {
        var dataBuff = encode(data);
        var sizeBuff = Buffer.alloc(2);
        sizeBuff.writeUInt16LE(dataBuff.length);

        var buff = Buffer.concat([sizeBuff, dataBuff], dataBuff.length + 2);
        return buff;
    },

	parse: function(c: Client, data: any):void {
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