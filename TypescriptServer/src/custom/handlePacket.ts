import trace from '#util/logging';
import MatchMaker from '#util/matchmaker';
import { Account, IAccount } from '#schemas/account';
import Client from '#concepts/client';
import Lobby, { lobbyGet } from '#concepts/lobby';
import Point from '#types/point';
import semver from 'semver';
import chalk from 'chalk';
import { Socket as TCPSocket } from 'net';
import { WebSocket as WSSocket } from 'ws';

/**
 * @param {Client} c
 * @param data {{ cmd: string }} Data
 */
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
            c.sendPong(data.T);
            break;
        case 'pong':
            let t = data.T;
            let new_t = new Date().getTime();
            let dt = new_t - t - global.start_time;

            c.ping = dt;

            // c.sendPing(); // send ping again
            // jk don't send ping again that's a memory leak
            break;

        // preset commands
        case 'login':
            var { username, password } = data;
            c.tryLogin(username, password);
            break;
        case 'register':
            var { username, password } = data;
            c.tryRegister(username, password);
            break;
        
        case 'lobby list':
            c.sendLobbyList();
            break;
        case 'lobby info':
            var lobbyid = data.lobbyid;
            c.sendLobbyInfo(lobbyid);
            break;
        case 'lobby join':
            c.lobbyJoin(data.lobbyid);
            break;
        case 'lobby leave':
            var lobby:Lobby = c.lobby;
            if (lobby !== null) {
                lobby.kickPlayer(c, 'you left the lobby', false);
            }
            break;
        
        case 'party join':
            var partyid = data.partyid;
            c.partyJoin(partyid);
            break;
        case 'party leave':
            if (!c.party) return;
            c.partyLeave();
            break;
        case 'party disband':
            if (!c.party) return;
            if (!c.party.isLeader(c)) return;

            c.party.disband();
            break;
        case 'party invite':
            var profileid = data.profileid;
            var user = global.clients.find(u => u.profile.id === profileid);

            if (user)
                c.partyInvite(user);
            break;
        
        case 'room transition':
            if (!c.room) return;

            var room_to_name:string = data.room_to;
            var room_to = c.lobby.rooms.find(room => room.map.name === room_to_name || room.map.room_name === room_to_name);
            c.room.movePlayer(c, room_to);
            break;
        
        case 'server timestamp':
            c.sendServerTime(data.t);
            break;

        // #######################
        // Add your commands here:
        
        case 'player controls':
            if (!c.entity) break;

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