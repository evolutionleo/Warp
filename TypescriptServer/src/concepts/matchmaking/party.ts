import Client from "../client";
import * as crypto from 'crypto';
import { ProfileInfo } from "#schemas/profile";
import Ticket, { MatchRequirements } from "#matchmaking/ticket";
import MatchMaker from "#matchmaking/matchmaker";
import Match from "#matchmaking/match";


export type PartyInfo = {
    partyid: string;
    members: string[];
    leader: string;
};

// use this instead of calling the new Party() contructor directly
export function partyCreate(leader:Client):Party {
    const party = new Party(leader);

    while(true) {
        // a random 6-digit number
        let partyid = crypto.randomInt(100000, 999999).toString();
        if (partyid in global.parties) { // just in case of a collision
            continue;
        }
        else {
            global.parties[partyid] = party;
            party.partyid = partyid;
            break;
        }
    }

    return party;
}

export function partyGet(partyid: string):Party {
    return global.parties[partyid];
}

export function partyExists(partyid: string) {
    return global.parties.hasOwnProperty(partyid);
}

export function partyDelete(partyid: string):void {
    let party = global.parties[partyid];
    party.disband();
}


export default class Party {
    partyid: string;
    members: Client[];
    leader: Client;
    max_members: number; // inherited from config.party.max_members

    get party_size() { return this.members.length; }

    ticket:Ticket = null; // current matchmaking ticket (null = not looking for a match)
    match:Match = null;

    constructor(leader:Client) {
        this.members = [];
        this.max_members = global.config.party.max_members;

        this.leader = leader;
        this.addMember(leader);

        this.send();
    }

    addMember(member: Client): void {
        if (member.party === this) return;
        else if (this.members.length >= this.max_members) {
            member.onPartyReject(this, 'party full');
            return;
        }
        else if (member.party) {
            member.party.kickMember(member, 'changing parties', true);
        }

        this.matchMakingStop();

        this.members.push(member);
        member.party = this;

        this.send();
    }

    kickMember(member: Client, reason: string = '', forced: boolean = true): void {
        // leave matchmaking
        this.matchMakingStop();

        if (this.isLeader(member)) {
            if (this.members.length == 1) { // if no one else left
                this.leader = null;
            }
            else {
                // find the first member to become the new party leader
                this.leader = this.members.find(m => m != member);
            }
        }

        let idx = this.members.indexOf(member);
        if (idx === -1)
            return;

        this.members.splice(idx, 1);
        member.onPartyLeave(this, reason, forced);
        member.party = null;

        // delete the party ID if everyone left
        if (this.members.length == 0)
            this.delete();
        else {
            this.send();
        }
    }

    disband() {
        this.members.forEach(member => this.kickMember(member, 'party disbanded', true));
    }

    private delete() {
        delete global.parties[this.partyid];
    }

    matchMakingStart(req:MatchRequirements):Ticket|string {
        if (this.ticket !== null) return 'already matchmaking';
        if (this.match !== null) return 'already in a match';

        this.ticket = MatchMaker.createTicket(this, req);

        // failed to create a ticket
        if (this.ticket === null) {
            return 'unable to start matchmaking';
        }

        return this.ticket;
    }

    matchMakingStop() {
        if (this.ticket === null) return;

        this.ticket.remove();
        this.ticket = null;
    }

    setLeader(leader: Client): void {
        this.leader = leader;
    }

    isLeader(member: Client): boolean {
        return this.leader == member;
    }

    isMember(client: Client): boolean {
        return this.members.includes(client);
    }

    getAvgMMR() {
        if (this.members.length == 0) return 0;
        return this.members.reduce((v, m) => v + m.mmr, 0) / this.members.length;
    }

    get mmr() {
        return this.getAvgMMR();
    }

    send() {
        this.members.forEach(member => {
            member.sendPartyInfo(this);
        });
    }


    getInfo():PartyInfo {
        return {
            partyid: this.partyid,
            members: this.members.map(m => m.name),
            leader: this.leader?.name
        };
    }
};