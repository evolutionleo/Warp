const { encode, decode } = require('@msgpack/msgpack');
const { handlePacket } = require('../custom/handlePacket.js');

module.exports = packet = class {
    static build(data) {
        var dataBuff = encode(data);
        var sizeBuff = Buffer.alloc(2);
        sizeBuff.writeUInt16LE(dataBuff.length);

        var buff = Buffer.concat([sizeBuff, dataBuff], dataBuff.length + 2);
        return buff;
    }

    static parse(c, data) {
        var dataSize = data.length;
        for(var i = 0; i < dataSize;) {
            var packSize = data.readUInt16LE(i); // unpack the size
            i += 2;

            var dataPack = Buffer.alloc(packSize); // unpack the data
            data.copy(dataPack, 0, i, i+packSize);
            i += packSize;
            

            // pass the decoded data to handlePacket()
            handlePacket(c, decode(dataPack));
        }
    }
};