import trace from '#util/logging';
import { encode, decode } from '@msgpack/msgpack';
import { handlePacket } from '#cmd/handlePacket';

export default class packet {
    /**
     * @param {object} data
     * @returns {Uint8Array} pack
     */
    static build(data) {
        var dataBuff = encode(data);
        var sizeBuff = Buffer.alloc(4);
        sizeBuff.writeUInt32LE(dataBuff.length);
        
        var buff = Buffer.concat([sizeBuff, dataBuff], dataBuff.length + 4);
        
        return buff;
    }
    
    /**
     * @param {object} data
     * @returns {Uint8Array} pack
     */
    static ws_build(data) {
        return encode(data);
    }
    
    
    
    /**
     * @param {any} c
     * @param {Buffer} data
     */
    static parse(c, data) {
        if (c.halfpack === undefined)
            c.halfpack = null;
        
        
        if (c.halfpack !== null) {
            data = Buffer.concat([c.halfpack, data], c.halfpack.length + data.length);
            c.halfpack = null;
        }
        
        var dataSize = data.length;
        
        for (var i = 0; i < dataSize;) {
            if (i + 4 > dataSize) { // a split in the size bits
                c.halfpack = Buffer.alloc(dataSize - i);
                data.copy(c.halfpack, 0, i, dataSize);
                break;
            }
            
            var packSize = data.readUInt32LE(i); // unpack the size
            i += 4;
            
            if (i + packSize > dataSize) {
                i -= 4;
                c.halfpack = Buffer.alloc(dataSize - i);
                data.copy(c.halfpack, 0, i, dataSize);
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
     * @param {Client} c
     * @param {Buffer} data
     */
    static ws_parse(c, data) {
        try {
            // pass the decoded data to handlePacket()
            handlePacket(c, decode(data));
        }
        catch (e) {
            trace('An error occurred while parsing the packet: ' + e.message);
        }
    }
}
;
