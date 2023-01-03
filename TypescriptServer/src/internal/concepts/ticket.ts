import Client from "./client";
import Party from "./party";


export type MatchRequirements = {
    gamemode: string;
}

export default abstract class Ticket {
    created: number; // timestamp
    by: Party|Client;
    requirements: MatchRequirements = {
        gamemode: 'any'
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
        this.by = this.by as Client;
    }
}

export class PartyTicket extends Ticket {
    constructor(by:Party, requirements:MatchRequirements) {
        super(by, requirements);
        this.by = this.by as Party;
    }
}