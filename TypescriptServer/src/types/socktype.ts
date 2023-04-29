import { WebSocket } from 'ws';
import { Socket } from 'net';

type SockType = 'tcp' | 'ws';
type Sock = WebSocket | Socket;
export { Sock, SockType };
export default SockType;