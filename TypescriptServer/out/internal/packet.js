import { encode, decode } from '@msgpack/msgpack';
import handlePacket from '#custom/handlePacket';
export default class packet {
    static build(data) {
        var dataBuff = encode(data);
        var sizeBuff = Buffer.alloc(2);
        sizeBuff.writeUInt16LE(dataBuff.length);
        var buff = Buffer.concat([sizeBuff, dataBuff], dataBuff.length + 2);
        // console.log(buff);
        return buff;
    }
    static parse(c, data) {
        var dataSize = data.length;
        // console.log('global packet size: ' + dataSize);
        for (var i = 0; i < dataSize;) {
            var packSize = data.readUInt16LE(i); // unpack the size
            i += 2;
            var dataPack = Buffer.alloc(packSize); // unpack the data
            data.copy(dataPack, 0, i, i + packSize);
            i += packSize;
            // pass the decoded data to handlePacket()
            handlePacket(c, decode(dataPack));
        }
    }
}
;
