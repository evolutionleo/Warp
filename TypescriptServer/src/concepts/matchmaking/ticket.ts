import Client from "#concepts/client";
import Party from "#matchmaking/party";
import MatchMaker from "#matchmaking/matchmaker";


export type MatchRequirements = {
    game_mode: string;
}

export type TicketInfo = {
    req: MatchRequirements,
    mmr: number,
    party_size: number
}

export default abstract class Ticket {
    created: number; // timestamp
    by: Party|Client; // who created this Ticket (either a single player or a Party)
    is_party: boolean; // true if this is a PartyTicket

    get party_size():number {
        return this.is_party ? (this.by as Party).members.length : 1;
    }
    
    get avg_mmr() { return this.by.mmr; }
    get mmr() { return this.avg_mmr; }

    get combined_mmr() { return this.avg_mmr * this.party_size; }

    requirements: MatchRequirements = {
        game_mode: 'any'
    };

    constructor(by:Party|Client, requirements:MatchRequirements) {
        this.created = Date.now();
        this.by = by;
        this.requirements = requirements;
    }

    add() {
        let q = MatchMaker.queues[this.requirements.game_mode];
        q.add(this);
    }

    remove() {
        let q = MatchMaker.queues[this.requirements.game_mode];
        q.remove(this);
    }

    getInfo():TicketInfo {
        return {
            party_size: this.party_size,
            mmr: this.avg_mmr,
            req: this.requirements
        }
    }
}

export class SingleTicket extends Ticket {
    constructor(by:Client, requirements:MatchRequirements) {
        super(by, requirements);
        this.is_party = false;
        this.by = this.by as Client;
    }
}

export class PartyTicket extends Ticket {
    constructor(by:Party, requirements:MatchRequirements) {
        super(by, requirements);
        this.is_party = true;
        this.by = this.by as Party;
    }
}