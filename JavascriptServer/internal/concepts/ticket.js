
export default class Ticket {
    created; // timestamp
    by;
    requirements = {
        gamemode: 'any'
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
        this.by = this.by;
    }
}

export class PartyTicket extends Ticket {
    constructor(by, requirements) {
        super(by, requirements);
        this.by = this.by;
    }
}
