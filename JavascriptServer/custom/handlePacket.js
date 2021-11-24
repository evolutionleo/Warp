import trace from '#util/logging';
import { findLobby } from '#util/lobby_functions';
import MatchMaker from '#util/matchmaker';
const { make_match } = MatchMaker;
import { Account } from '#schemas/account';

export default async function handlePacket(c, data) {
    var cmd = data.cmd.toLowerCase();
    // trace('received command: ' + cmd);
    switch (cmd) {
        case 'hello':
            trace("Hello from client: " + data.kappa);
            c.sendHello();
            break;
        case 'hello2':
            trace('Second hello from client: ' + data.kappa);
            break;
        case 'message':
            trace('Message from client: ' + data.msg);
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
                trace('error: ' + reason);
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
            c.entity.inputs = {
                move: data.move,
                keys: {
                    kright: data.kright,
                    kleft: data.kleft,
                    kup: data.kup,
                    kdown: data.kdown,
                    kjump: data.kjump,
                    kjump_rel: data.kjump_rel,
                    kjump_press: data.kjump_press
                }
            };
            c.entity.send();
            // c.sendPlayerControls(data);
            break;
    }
}
