import { findLobby } from '#util/lobby_functions';
import MatchMaker from '#util/matchmaker';
import { Account } from '#schemas/account';
const { make_match } = MatchMaker;
export default async function handlePacket(c, data) {
    var cmd = data.cmd.toLowerCase();
    // console.log('received command: ' + cmd);
    switch (cmd) {
        case 'hello':
            console.log("Hello from client: " + data.kappa);
            c.sendHello();
            break;
        case 'hello2':
            console.log('Second hello from client: ' + data.kappa);
            break;
        case 'message':
            console.log('Message from client: ' + data.msg);
            c.sendMessage(data.msg + ' indeed');
            break;
        // preset commands
        case 'login':
            var { username, password } = data;
            Account.login(username, password)
                .then(function (account) {
                // this also sends the message
                c.login(account);
            }).catch(function (reason) {
                c.sendLogin('fail', reason);
            });
            break;
        case 'register':
            var { username, password } = data;
            Account.register(username, password)
                .then(function (account) {
                // this also sends the message
                c.register(account);
            }).catch(function (reason) {
                console.log('error: ' + reason);
                c.sendRegister('fail', reason.toString());
            });
            break;
        case 'lobby list':
            c.sendLobbyList();
            break;
        case 'lobby info':
            var lobbyid = data.lobbyid;
            c.sendLobbyInfo(lobbyid);
            break;
        case 'lobby join':
            var lobbyid = data.lobbyid;
            var lobby;
            if (lobbyid) {
                lobby = findLobby(lobbyid);
            }
            else {
                lobby = make_match(c);
            }
            // it also sends the response
            lobby.addPlayer(c);
            break;
        case 'lobby leave':
            var lobby = c.lobby;
            if (lobby !== null) {
                lobby.kickPlayer(c, 'you left the lobby', false);
            }
            break;
        // #######################
        // Add your commands here:
        case 'room transition':
            var room_to_name = data.room_to;
            var room_to = c.lobby.rooms.find(room => room.map.name === room_to_name);
            c.room.movePlayer(c, room_to);
            break;
        case 'player controls':
            const { kjump, move } = data;
            let p = c.entity;
            // if (Math.sign(p.spd.x) == Math.sign(move.x) && Math.abs(p.spd.x) > 7) {}
            // else {
            p.spd.x += move.x * .1;
            // }
            // if (Math.sign(p.spd.y) == Math.sign(move.y) && Math.abs(p.spd.y) > 7) {}
            // else {
            p.spd.y += move.y * .1;
            // }
            // p.move(move.x * 7, move.y * 7);
            if (kjump && p.placeMeeting(p.x, p.y + 1)) {
                p.spd.y = -10;
            }
            break;
    }
}
