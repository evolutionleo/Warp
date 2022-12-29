import trace from '#util/logging';
import { findLobby } from '#util/lobby_functions';
import MatchMaker from '#util/matchmaker';
import { Account, IAccount } from '#schemas/account';
import Client from '#concepts/client';
import Lobby from '#concepts/lobby';
import Point from '#types/point';
import semver from 'semver';
import chalk from 'chalk';
import { Socket as TCPSocket } from 'net';
import { WebSocket as WSSocket } from 'ws';

const { make_match } = MatchMaker;

export default async function handlePacket(c:Client, data:any) {
    var cmd = data.cmd.toLowerCase();
    // trace('received command: ' + cmd);
    
    switch(cmd) {
        case 'hello':
            trace('Hello from client: "' + data.greeting + '"');
            c.sendHello();
            break;
        case 'client info':
            let info = data;
            delete info.cmd;
            trace('info about client: ' + JSON.stringify(info));
        
            const client_game_version = data.game_version;
            const client_warp_version = data.warp_version;
            const compatible_versions = global.config.meta.compatible_game_versions
            const warp_version = global.config.meta.warp_version;

            const warp_version_match = semver.cmp(client_warp_version, '=', warp_version);
            const version_compatible = semver.satisfies(client_game_version, compatible_versions);

            const compatible = warp_version_match && version_compatible;

            c.sendServerInfo(compatible);
            
            // not compatible - disconnect the client
            if (!compatible) {
                trace(chalk.yellowBright(`Kicking incompatible client! (client version ${client_game_version}, server version ${global.config.meta.game_version})`));

                // immediately close the socket after 1 last packet
                setImmediate(() => {
                    // close the socket
                    if (c.type == 'tcp') {
                        const s = c.socket as TCPSocket;
                        s.destroy();
                    }
                    else {
                        const s = c.socket as WSSocket;
                        s.close();
                    }
                });
            }
            break;
        case 'message':
            trace('Message from client: '+data.msg);
            c.sendMessage(data.msg+' indeed');
            break;
        case 'ping':
            c.sendPong(data.t);
            break;
        case 'pong':
            let t = data.t;
            let new_t = new Date().getTime();
            let dt = new_t - t;

            c.ping = dt;

            // c.sendPing(); // send ping again
            // jk don't send ping again that's a memory leak
            break;

        // preset commands
        case 'login':
            var { username, password } = data;
            Account.login(username, password)
            .then(function(account:IAccount) {
                // this also sends the message
                c.login(account);
            }).catch(function(reason) {
                c.sendLogin('fail', reason);
            });
            break;
        case 'register':
            var { username, password } = data;
            Account.register(username, password)
            .then(function(account:IAccount) {
                // this also sends the message
                c.register(account);
            }).catch(function(reason:Error) {
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
            var lobby:Lobby;
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
            var lobby:Lobby = c.lobby;
            if (lobby !== null) {
                lobby.kickPlayer(c, 'you left the lobby', false);
            }
            break;
        
        case 'room transition':
            if (!c.room) { return; }

            var room_to_name:string = data.room_to;
            var room_to = c.lobby.rooms.find(room => room.map.name === room_to_name || room.map.room_name === room_to_name);
            c.room.movePlayer(c, room_to);
            break;

        // #######################
        // Add your commands here:
        
        case 'player controls':
            c.entity.inputs = {
                move: data.move as Point,
                keys: {
                    kright: data.kright,
                    kleft: data.kleft,
                    kup: data.kup,
                    kdown: data.kdown,

                    kjump: data.kjump,
                    kjump_rel: data.kjump_rel,
                    kjump_press: data.kjump_press
                }
            }
            c.entity.send();
            // c.sendPlayerControls(data);
            break;
        

        default:
            trace(chalk.yellowBright(`Warning! Unhandled cmd type: '${data.cmd}'`));
            break;
    }
}