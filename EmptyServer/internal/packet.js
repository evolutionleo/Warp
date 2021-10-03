const { encode, decode } = require('@msgpack/msgpack');
const handlePacket       = require('./../custom/handlePacket.js');

module.exports = packet = class packet {
    /**
     * 
     * @param {Object} data 
     * @returns {Buffer} pack
     */
    static build(data) {
        var dataBuff = encode(data);
        var sizeBuff = Buffer.alloc(2);
        sizeBuff.writeUInt16LE(dataBuff.length);

        var buff = Buffer.concat([sizeBuff, dataBuff], dataBuff.length + 2);
        // trace(buff);

        return buff;
    }

    /**
     * 
     * @param {Object} data 
     * @returns {Buffer} pack
     */
    static ws_build(data) {
        return encode(data);
    }



    /**
     * 
     * @param {any} c 
     * @param {Buffer} data 
     */
    static parse(c, data) {
        if (c.halfpack === undefined)
            c.halfpack = null;


        if (c.halfpack !== null) {
            data = Buffer.concat([c.halfpack, data], c.halfpack.length + data.length)
            trace('-one out');
            c.halfpack = null;

            // trace('converted packet: ', data.toString());
        }

        var dataSize = data.length;

        // trace('global packet size: ' + dataSize);

        for(var i = 0; i < dataSize;) {
            if (i + 2 <= dataSize) {
                var packSize = data.readUInt16LE(i); // unpack the size
            }
            else {
                var packSize = 0;
            }
            
            if (i + packSize > dataSize || packSize == 0) {
                c.halfpack = Buffer.alloc(dataSize - i);
                data.copy(c.halfpack, 0, i, dataSize);
                trace('one in-');
                break;
            }
            i += 2;

            var dataPack = Buffer.alloc(packSize); // unpack the data
            data.copy(dataPack, 0, i, i+packSize);
            i += packSize;
            

            try {
                // pass the decoded data to handlePacket()
                handlePacket(c, decode(dataPack));
            }
            catch(e) {
                trace('An error occurred while parsing the packet: ' + e.message);
            }
        }
    }

    /**
     * 
     * @param {any} c 
     * @param {Buffer} data 
     */
    static ws_parse(c, data) {
        try {
            // pass the decoded data to handlePacket()
            handlePacket(c, decode(data));
        }
        catch(e) {
            trace('An error occurred while parsing the packet: ' + e.message);
        }
    }
};