const encode = MessagePack.encode,
      decode = MessagePack.decode;


/**
 * @class
 * @name Client
 */
class Client {
    socket;

    constructor() {
        this.encode = MessagePack.encode;
        this.decode = MessagePack.decode;


        this.cmdHandlers = {};


        let protocol = config.ssl_enabled ? 'wss' : 'ws';
        this.socket = new WebSocket(`${protocol}://${config.server_ip}:${config.server_port}`, protocol);

        this.socket.onopen = () => {
            // this.sendHello();
            this.send({cmd: 'hello', kappa: 'peppega'})
        }

        this.socket.onmessage = async (ev) => {
            const buff = await ev.data.arrayBuffer();
            console.log(buff);

            const data = decode(buff);
            console.log(data);
            this.handlePacket(data);
        };

        /**
         * @param {ErrorEvent} ev
         */
        this.socket.onerror = (ev) => {
            console.error(ev.error);
        }
    }


    /**
     * 
     * @param {Object} data 
     */
    handlePacket(data) {
        this.emit('data', data);
        this.emit(data.cmd, data);
    }

    send(data) {
        return this.socket.send(encode(data));
    }


    /** @callback CmdCallback
     *  @param {Object} data
     */

    /**
     * 
    * @param {string} event
    * @param {CmdCallback} cb
        */
    on(cmd, cb) {
        let handlers = this.cmdHandlers[cmd];

        if (handlers === null || handlers === undefined) {
            this.cmdHandlers[cmd] = [ cb ];
        }
        else {
            this.cmdHandlers[cmd].push(cb);
        }
    }


    /**
     * 
     * @param {string} cmd 
     * @param {Object} data 
     */
    emit(cmd, data) {
        let handlers = this.cmdHandlers[cmd];
        if (handlers) {
            for (let handler of handlers) {
                handler(data);
            }
        }
    }
}

const client = new Client();
window.client = client;