import trace from '#util/logging';
import packet from '#packet';
import chalk from 'chalk';


// sender functions can be later called using some_client.sendThing()
// in handlePacket.js or wherever else where you have client objects

export class SendStuff {
    
    /**
     * basic send
     * @param {any} data
     */
    write(data) {
        if (global.config.timestamps_enabled) { // { t: ms passed since the server started }
            data.t = Date.now() - global.start_time;
        }
        
        if (this.type === 'ws') {
            this.socket.send(packet.ws_build(data));
        }
        else {
            this.socket.write(packet.build(data));
        }
    }
    
    /**
     * same as .write()
     * @param {object} data
     */
    send(data) {
        return this.write(data);
    }
    
    // different types of broadcast
    /**
     * @param {Client[]} clients
     * @param {object} pack
     * @param {boolean} [notme=true]
     */
    broadcastList(clients, pack, notme = true) {
        clients.forEach((c) => {
            if (c === this && notme) { }
            else {
                c.write(pack);
            }
        });
    }
    
    /**
     * @param {object} pack
     * @param {boolean} [notme=true]
     */
    broadcastAll(pack, notme) {
        return this.broadcastList(global.clients, pack, notme);
    }
    
    /**
     * @param {object} pack
     * @param {boolean} [notme=true]
     */
    broadcastLobby(pack, notme) {
        if (this.lobby === null)
            return -1;
        
        return this.broadcastList(this.lobby.players, pack, notme);
    }
    
    broadcastRoom(pack, notme) {
        if (!global.config.rooms_enabled) {
            trace(chalk.redBright('Can\'t use Client.broadcastRoom() - rooms are disabled in the config!!!'));
            return -1;
        }
        if (this.room === null)
            return -1;
        
        return this.broadcastList(this.room.players, pack, notme);
    }
    
    
    // ##############################################
    // You can add your custom senders either here directly, or inside cmd/senders/
    
    // for example:
    sendHello() {
        this.send({ cmd: 'hello', str: 'Hello, client!' });
    }
    
    /**
     * @param {string} msg
     */
    sendMessage(msg) {
        this.send({ cmd: 'message', msg });
    }
}

export default SendStuff;
