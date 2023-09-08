import MatchMaker from "#matchmaking/matchmaker";

export default class Ticket {
    created; // timestamp
    by; // who created this Ticket (either a single player or a Party)
    is_party; // true if this is a PartyTicket
    
    get party_size() {
        return this.is_party ? this.by.members.length : 1;
    }
    
    get avg_mmr() { return this.by.mmr; }
    get mmr() { return this.avg_mmr; }
    
    get combined_mmr() { return this.avg_mmr * this.party_size; }
    
    requirements = {
        game_mode: 'any'
    };
    
    constructor(by, requirements) {
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
    
    getInfo() {
        return {
            party_size: this.party_size,
            mmr: this.avg_mmr,
            req: this.requirements
        };
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
