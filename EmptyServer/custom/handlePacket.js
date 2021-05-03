module.exports.handlePacket = 
function(c, data) {
    var cmd = data.cmd.toLowerCase();
    
    switch(cmd) {
        case 'hello':
            console.log("Hello from client: "+data.kappa);
            c.sendHello();
            break;
        case 'hello2':
            console.log('Second hello from client: '+data.kappa);
            break;
        case 'message':
            console.log('Message from client: '+data.msg);
            c.sendMessage(data.msg+' indeed');
            break;
        // Add your commands here:
    }
}