
export default class Ticket {
    created; // timestamp
    by; // who created this Ticket (either a single player or a Party)
    is_party; // true if this is a PartyTicket
    
    get avg_mmr() { return this.by.mmr; }
    
    requirements = {
        game_mode: 'any'
    };
    
    constructor(by, requirements) {
        this.created = Date.now();
        this.by = by;
        this.requirements = requirements;
    }
}

export class SingleTicket extends Ticket {
    constructor(by, requirements) {
        super(by, requirements);
        this.is_party = false;
        this.by = this.by;
    }
}

export class PartyTicket extends Ticket {
    constructor(by, requirements) {
        super(by, requirements);
        this.is_party = true;
        this.by = this.by;
    }
}
