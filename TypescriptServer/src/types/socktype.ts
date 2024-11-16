import { WebSocket } from 'ws';
import { Socket as TCPSocket } from 'net';

type SockType = 'tcp' | 'ws';
type Sock = TCPSocket | WebSocket;
export { Sock, SockType };
export default SockType;