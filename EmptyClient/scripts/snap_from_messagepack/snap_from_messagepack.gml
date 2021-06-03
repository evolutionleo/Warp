/// @return Nested struct/array data decoded from the buffer, using the messagepack standard
///
/// More information on messagepack can be found here: https://msgpack.org/index.html
/// 
/// @param buffer           Binary data to be decoded, created by snap_to_binary()
/// @param [offset]         Start position for binary decoding in the buffer. Defaults to 0, the start of the buffer
/// @param [destroyBuffer]  Set to <true> to destroy the input buffer. Defaults to <false>
/// 
/// @jujuadams 2021-06-03

function snap_from_messagepack()
{
    var _buffer         = argument[0];
    var _offset         = ((argument_count > 1) && (argument[1] != undefined))? argument[1] : 0;
    var _destroy_buffer = ((argument_count > 2) && (argument[2] != undefined))? argument[2] : false;
    
    var _old_tell = buffer_tell(_buffer);
    buffer_seek(_buffer, buffer_seek_start, _offset);
    var _result = (new __snap_from_messagepack_parser(_buffer)).root;
    buffer_seek(_buffer, buffer_seek_start, _old_tell);
    
    if (_destroy_buffer) buffer_delete(_buffer);
    
    return _result;
}

function __snap_from_messagepack_parser(_buffer) constructor
{
    buffer = _buffer;
    
    static read_struct = function(_size)
    {
        var _struct = {};
        repeat(_size)
        {
            var _key   = read_value();
            var _value = read_value();
            variable_struct_set(_struct, _key, _value);
        }
        return _struct;
    }
    
    static read_array = function(_size)
    {
        var _array = array_create(_size, undefined);
        var _i = 0;
        repeat(_size)
        {
            _array[@ _i] = read_value();
            ++_i;
        }
        return _array;
    }
    
    static read_string = function(_size)
    {
        //Return an empty string if we don't expect any data whatsoever
        if (_size == 0) return "";
        
        var _null_position = buffer_tell(buffer) + _size;
        if (_null_position >= buffer_get_size(buffer))
        {
            //If the string runs into the end of the buffer, just read out the string
            return buffer_read(buffer, buffer_text);
        }
        
        //Read the byte just after the end of the string and replace it with 0x00
        var _peek = buffer_peek(buffer, _null_position, buffer_u8);
        buffer_poke(buffer, _null_position, buffer_u8, 0x00);
        
        //Get GM to read from the start of the string to the null byte
        var _string = buffer_read(buffer, buffer_string);
        
        //Take a step back and replace the original byte with what we found before
        buffer_seek(buffer, buffer_seek_relative, -1);
        buffer_poke(buffer, _null_position, buffer_u8, _peek);
        
        return _string;
    }
    
    static read_bin = function(_size)
    {
        var _array = array_create(_size);
        
        var _i = 0;
        repeat(_size)
        {
            _array[@ _i] = buffer_read(buffer, buffer_u8);
            ++_i;
        }
        
        return {
            messagepack_datatype__ : "bin",
            data : _array
        };
    }
    
    static read_ext = function(_size)
    {
        var _type = buffer_read(buffer, buffer_s8);
        var _array = array_create(_size);
        
        var _i = 0;
        repeat(_size)
        {
            _array[@ _i] = buffer_read(buffer, buffer_u8);
            ++_i;
        }
        
        return {
            messagepack_datatype__ : "ext",
            type : _type,
            data : _array
        };
    }
    
    static buffer_read_little = function(_datatype)
    {
        switch(buffer_sizeof(_datatype))
        {
            case 1:
                return buffer_read(buffer, _datatype);
            break;
            
            case 2:
                buffer_poke(flip_buffer, 1, buffer_u8, buffer_read(buffer, buffer_u8));
                buffer_poke(flip_buffer, 0, buffer_u8, buffer_read(buffer, buffer_u8));
            break;
            
            case 4:
                buffer_poke(flip_buffer, 3, buffer_u8, buffer_read(buffer, buffer_u8));
                buffer_poke(flip_buffer, 2, buffer_u8, buffer_read(buffer, buffer_u8));
                buffer_poke(flip_buffer, 1, buffer_u8, buffer_read(buffer, buffer_u8));
                buffer_poke(flip_buffer, 0, buffer_u8, buffer_read(buffer, buffer_u8));
            break;
            
            case 8:
                buffer_poke(flip_buffer, 7, buffer_u8, buffer_read(buffer, buffer_u8));
                buffer_poke(flip_buffer, 6, buffer_u8, buffer_read(buffer, buffer_u8));
                buffer_poke(flip_buffer, 5, buffer_u8, buffer_read(buffer, buffer_u8));
                buffer_poke(flip_buffer, 4, buffer_u8, buffer_read(buffer, buffer_u8));
                buffer_poke(flip_buffer, 3, buffer_u8, buffer_read(buffer, buffer_u8));
                buffer_poke(flip_buffer, 2, buffer_u8, buffer_read(buffer, buffer_u8));
                buffer_poke(flip_buffer, 1, buffer_u8, buffer_read(buffer, buffer_u8));
                buffer_poke(flip_buffer, 0, buffer_u8, buffer_read(buffer, buffer_u8));
            break;
        }
        
        return buffer_peek(flip_buffer, 0, _datatype);
    }
    
    static read_value = function()
    {
        var _byte = buffer_read(buffer, buffer_u8);
        
        if (_byte <= 0x7f) //positive fixint 0x00 -> 0x7f
        {
            //First 7 bits are the integer
            return int64(_byte & 0x7f);
        }
        else if (_byte <= 0x8f) //fixmap 0x80 -> 0x8f
        {
            //Size is determined by the first 4 bits
            return read_struct(_byte & 0x0f);
        }
        else if (_byte <= 0x9f) //fixarray 0x90 -> 0x9f
        {
            //Size is determined by the first 4 bits
            return read_array(_byte & 0x0f);
        }
        else if (_byte <= 0xbf) //fixstr 0xa0 -> 0xbf
        {
            //Size is determined by the first 5 bits
            return read_string(_byte & 0x1f);
        }
        else if ((_byte >= 0xe0) && (_byte <= 0xff)) //negative fixint 0xe0 -> 0xff
        {
            //First 5 bites are the integer
            return -(_byte & 0x1f);
        }
        else switch(_byte)
        {
            case 0xc0: /*191*/ return undefined; break; //nil
            case 0xc1: /*192*/ show_debug_message("snap_from_binary(): WARNING! Datatype 0xc1 found, but this value should never be used"); break; //Baby shoes for sale, never worn
            case 0xc2: /*193*/ return bool(false); break; //false
            case 0xc3: /*194*/ return bool(true ); break; //true
            
            case 0xc4: /*195*/ return read_bin(buffer_read(buffer, buffer_u8 )); break; //bin  8
            case 0xc5: /*196*/ return read_bin(buffer_read_little( buffer_u16)); break; //bin 16
            case 0xc6: /*197*/ return read_bin(buffer_read_little( buffer_u32)); break; //bin 32
            
            case 0xc7: /*198*/ return read_ext(buffer_read(buffer, buffer_u8 )); break; //ext  8
            case 0xc8: /*199*/ return read_ext(buffer_read_little( buffer_u16)); break; //ext 16
            case 0xc9: /*201*/ return read_ext(buffer_read_little( buffer_u32)); break; //ext 32
            
            case 0xca: /*202*/ return buffer_read_little(buffer_f32); break; //float 32
            case 0xcb: /*203*/ return buffer_read_little(buffer_f64); break; //float 64
            
            case 0xcc: /*204*/ return buffer_read(buffer,  buffer_u8 ); break; // uint  8
            case 0xcd: /*205*/ return buffer_read_little(  buffer_u16); break; // uint 16
            case 0xce: /*206*/ return buffer_read_little(  buffer_u32); break; // uint 32
            case 0xcf: /*207*/ return buffer_read_little(  buffer_u64); break; // uint 64
            
            case 0xd0: /*208*/ return  buffer_read(buffer, buffer_s8 ); break; //  int  8
            case 0xd1: /*209*/ return buffer_read_little(  buffer_s16); break; //  int 16
            case 0xd2: /*210*/ return buffer_read_little(  buffer_s32); break; //  int 32
            case 0xd3: /*211*/ return buffer_read_little(  buffer_u64); break; //  int 64 !!! No signed 64-bit integer read in GameMaker
            
            case 0xd4: /*212*/ return read_ext( 1); break; //fixext  1
            case 0xd5: /*213*/ return read_ext( 2); break; //fixext  2
            case 0xd6: /*214*/ return read_ext( 4); break; //fixext  4
            case 0xd7: /*215*/ return read_ext( 8); break; //fixext  8
            case 0xd8: /*216*/ return read_ext(16); break; //fixext 16
            
            case 0xd9: /*217*/ return read_string(buffer_read(buffer, buffer_u8 )); break; //str  8
            case 0xda: /*218*/ return read_string(buffer_read_little( buffer_u16)); break; //str 16
            case 0xdb: /*219*/ return read_string(buffer_read_little( buffer_u32)); break; //str 32
            
            case 0xdc: /*220*/ return read_array( buffer_read_little(buffer_u16)); break; //array 16
            case 0xdd: /*221*/ return read_array( buffer_read_little(buffer_u32)); break; //array 32
            
            case 0xde: /*222*/ return read_struct(buffer_read_little(buffer_u16)); break; //map 16
            case 0xdf: /*223*/ return read_struct(buffer_read_little(buffer_u32)); break; //map 32
            
            default:
                show_debug_message("snap_from_binary(): WARNING! Unsupported datatype " + string(_byte) + " found");
            break;
        }
        
        return undefined;
    }
    
    //messagepack is big-endian because the creator hates normalcy
    //This means we need to use a separate buffer for flipping values around
    flip_buffer = buffer_create(8, buffer_fixed, 1);
    root = read_value();
    buffer_delete(flip_buffer);
}