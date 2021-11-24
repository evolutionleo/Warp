import trace from '#util/logging';
import { encode, decode } from '@msgpack/msgpack';
import handlePacket from '#custom/handlePacket';

export default class packet {
    /**
     * 
     * @param {object} data 
     * @returns {Uint8Array} pack
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
     * @param {object} data 
     * @returns {Uint8Array} pack
     */
     static ws_build(data) {
        return encode(data);
    }


    /**
     * 
     * @param {Client} c 
     * @param {Buffer} data 
     */
    static parse(c, data) {
        if (c.halfpack === undefined)
            c.halfpack = null;
        
        if (c.halfpack !== null) {
            data = Buffer.concat([c.halfpack, data], c.halfpack.length + data.length);
            // trace('-one out');
            c.halfpack = null;
            // trace('converted packet: ', data.toString());
        }

        var dataSize = data.length;
        // trace('global packet size: ' + dataSize);
        for (var i = 0; i < dataSize;) {
            var packSize = data.readUInt16LE(i); // unpack the size
            i += 2;

            if (i + packSize > dataSize) {
                c.halfpack = Buffer.alloc(dataSize - (i - 2));
                data.copy(c.halfpack, 0, i - 2, dataSize);
                // trace('one in-');
                break;
            }

            var dataPack = Buffer.alloc(packSize); // unpack the data
            data.copy(dataPack, 0, i, i + packSize);
            i += packSize;
            
            try {
                // pass the decoded data to handlePacket()
                handlePacket(c, decode(dataPack));
            }
            catch (e) {
                trace('An error occurred while parsing the packet: ' + e.message);
            }
        }
    }

    /**
     * 
     * @param {Client} c 
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