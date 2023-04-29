import Lobby from "#concepts/lobby";
import Room from "#concepts/room";
import Point from '#types/point';
declare module '#cmd/sendStuff' {
    interface SendStuff {
        sendPlay(lobby: Lobby, room?: Room, start_pos?: Point, uuid?: string): void;
        sendRoomTransition(room_to: Room, start_pos?: Point, uuid?: string): void;
        sendGameOver(outcome: string, reason?: string): void;
    }
}
