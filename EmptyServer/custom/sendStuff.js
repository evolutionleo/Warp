module.exports = class SendStuff {
    constructor() {}

    write(data) {
        this.socket.write(packet.build(data));
    }
    
    // these functions can be called using %insert_client%.sendHello())
    // in handlePacket.js or wherever else
    sendHello() {
        this.write({cmd: 'hello', str: 'Hello, client!'})
        this.write({cmd: 'hello2', str: 'Hello again, client!'})
    }

    sendMessage(msg) {
        this.write({cmd: 'message', msg: msg})
    }

    // You can write your wrappers here:
    
}