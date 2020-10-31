const SendStuff = require("../custom/sendStuff");

module.exports = Client = class extends SendStuff {
    constructor(socket) {
        super();
        
        this.username = undefined;
        this.socket = socket;
        // you can add more variables here
    }
    
    broadcastAll(pack) {
        clients.forEach(function(c) {
            c.write(pack);
        });
    }
}