
export default class ClientProperties {
    /** @type {import('ws').WebSocket | import('net').Socket} */
    socket;
    /** @type {'ws' | 'tcp'} */
    type;
    
    /** @type {Lobby} */
    lobby = null;
    
    /** @type {Room} */
    room = null;
    
    /** @type {Party} */
    party = null;
    
    
    /** @type {Account} */
    account = null;
    /** @type {Profile} */
    profile = null;
    
    /** @type {Buffer} */
    halfpack; // used internally in packet.ts
    
    /** @type {PlayerEntity} */
    entity = null;
    
    /** @type {number} */
    ping;
    
    /** @type {number} */
    get mmr() {
        return this.account ? this.account.mmr : 0;
    }
    
    set mmr(_mmr) {
        if (this.account)
            this.account.mmr = _mmr;
    }
    
    /** @type {Client[]} */
    get friends() {
        return this.account ? this.account.friends : [];
    }
}
