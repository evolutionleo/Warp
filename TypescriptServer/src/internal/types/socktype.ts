import * as ws from 'ws';
import * as net from 'net';

type SockType = 'tcp' | 'ws';
type Sock = ws.WebSocket | net.Socket;
export { Sock, SockType };
export default SockType;