import SendStuff from "#cmd/sendStuff"
import Lobby from "#concepts/lobby"
import Room from "#concepts/room"
import Match, { MatchOutcome } from "#matchmaking/match"
import Point from '#types/point'

declare module '#cmd/sendStuff' {
    interface SendStuff {
        sendPlay(lobby:Lobby, room?:Room, start_pos?:Point, uuid?:string):void
        sendRoomTransition(room_to:Room, start_pos?:Point, uuid?:string):void
        sendGameOver(outcome: MatchOutcome, reason?:string):void
    }
}

/**
 * @param {Lobby} lobby 
 * @param {Room} room 
 * @param {Point} start_pos 
 * @param {string} [uuid=undefined]
 */
SendStuff.prototype.sendPlay = function(lobby:Lobby, room?:Room, start_pos?:Point, uuid?:string) {
    this.send({ cmd: 'play', lobby: lobby.getInfo(), room: room?.serialize(), start_pos, uuid });
}

/**
 * @param {Room} room_to
 * @param {Point} start_pos
 * @param {string} [uuid=undefined]
 */
SendStuff.prototype.sendRoomTransition = function(room_to:Room, start_pos?:Point, uuid?:string) {
    this.send({ cmd: 'room transition', room: room_to.serialize(), start_pos, uuid });
}

/**
 * @param {'win'|'loss'|'draw'} outcome
 * @param {string?} reason
 */
SendStuff.prototype.sendGameOver = function(outcome: MatchOutcome, reason:string = '') {
    this.send({ cmd: 'game over', outcome, reason });
}