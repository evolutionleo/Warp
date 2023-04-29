import Client from "./client";
import Party from "./party";


export type MatchRequirements = {
    game_mode: string;
}

export default abstract class Ticket {
    created: number; // timestamp
    by: Party|Client; // who created this Ticket (either a single player or a Party)
    is_party: boolean; // true if this is a PartyTicket
    
    get avg_mmr() { return this.by.mmr; }

    requirements: MatchRequirements = {
        game_mode: 'any'
    };

    constructor(by:Party|Client, requirements:MatchRequirements) {
        this.created = Date.now();
        this.by = by;
        this.requirements = requirements;
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