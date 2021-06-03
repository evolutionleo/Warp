const { findLobby, getLobbies } = require('./../internal/lobbyFunctions.js');
const Profile = require('../schemas/profile.js');
const Account = require('./../schemas/account.js');

module.exports = async function handlePacket(c, data) {
    var cmd = data.cmd.toLowerCase();
    // console.log('received command: ' + cmd);
    
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
        // preset commands
        case 'login':
            var { username, password } = data;
            Account.login(username, password)
            .then(function(account) {
                // this also sends the message
                c.login(account);
            }).catch(function(reason) {
                console.log(reason);
                c.sendLogin('fail', reason);
            })
            break;
        case 'register':
            var { username, password } = data;
            Account.register(username, password)
            .then(function(account) {
                // this also sends the message
                c.register(account);
            }).catch(function(reason) {
                c.sendRegister('fail', reason);
            })
            break;
        case 'lobby list':
            c.sendLobbyList();
            break;
        case 'lobby join':
            var lobbyid = data.lobbyid;
            var lobby = findLobby(lobbyid);
            
            // it also sends the response
            lobby.addPlayer(c);
            break;
        case 'lobby leave':
            var lobby = c.lobby;
            if (lobby !== null) {
                lobby.kickPlayer(c, 'you left the lobby', false);
            }
            break;

        // Add your commands here:
    }
}