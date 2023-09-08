import GameMode from "#concepts/game_mode";
import Party from "#matchmaking/party";
import Ticket, { PartyTicket } from "#matchmaking/ticket";


export default class MatchMakingQueue {
    ranked: boolean;
    mode: GameMode;
    team_size: number;

    tickets: Ticket[][] = [];

    constructor(mode_name:string) {
        let mode = global.game_modes[mode_name];
        this.mode = mode;
        this.ranked = this.mode.ranked;
        this.team_size = this.mode.team_size;

        for(let i = 0; i < this.team_size; i++) {
            this.tickets.push([]);
        }
    }

    sort() {
        for(let i = 0; i < this.team_size; i++) {
            this.tickets[i].sort((t1, t2) => t1.mmr - t2.mmr);
        }
    }

    add(ticket:Ticket) {
        let party_size = ticket.is_party ? (ticket.by as Party).members.length : 1;
        if (party_size > this.mode.team_size) {
            throw "Trying to add a party with too many members to matchmaking queue.";
        }

        let arr = this.tickets[party_size-1];
        arr.push(ticket);
    }

    get_all(party_size:number) {
        return this.tickets[party_size-1];
    }

    get(party_size:number, i:number) {
        return this.tickets[party_size-1][i];
    }

    count(party_size:number) {
        return this.tickets[party_size-1].length;
    }

    remove(ticket:Ticket) {
        let arr = this.tickets[ticket.party_size-1];
        let idx = arr.indexOf(ticket);
        if (idx !== -1)
            arr.splice(idx, 1);
    }
}