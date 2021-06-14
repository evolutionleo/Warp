const { encode, decode } = require('@msgpack/msgpack');
const handlePacket       = require('./../custom/handlePacket.js');

module.exports = class packet {
    static build(data) {
        var dataBuff = encode(data);
        var sizeBuff = Buffer.alloc(2);
        sizeBuff.writeUInt16LE(dataBuff.length);

        var buff = Buffer.concat([sizeBuff, dataBuff], dataBuff.length + 2);
        // console.log(buff);

        return buff;
    }

    static parse(c, data) {
        if (c.halfpack === undefined)
            c.halfpack = null;


        if (c.halfpack !== null) {
            data = Buffer.concat([c.halfpack, data], c.halfpack.length + data.length)
            console.log('-one out');
            c.halfpack = null;

            // console.log('converted packet: ', data.toString());
        }

        var dataSize = data.length;

        // console.log('global packet size: ' + dataSize);

        for(var i = 0; i < dataSize;) {
            var packSize = data.readUInt16LE(i); // unpack the size
            i += 2;

            if (i + packSize > dataSize) {
                c.halfpack = Buffer.alloc(dataSize - (i - 2));
                data.copy(c.halfpack, 0, i - 2, dataSize);
                console.log('one in-');
                break;
            }

            var dataPack = Buffer.alloc(packSize); // unpack the data
            data.copy(dataPack, 0, i, i+packSize);
            i += packSize;
            

            try {
                // pass the decoded data to handlePacket()
                handlePacket(c, decode(dataPack));
            }
            catch(e) {
                console.log('An error occurred while parsing the packet: ' + e.message);
            }
        }
    }
};