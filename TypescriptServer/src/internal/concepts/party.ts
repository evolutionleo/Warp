import Client from "./client";
import * as crypto from 'crypto';
import { ProfileInfo } from "#schemas/profile";


export type PartyInfo = {
    partyid: string;
    members: string[];
    leader: string;
};

// use this instead of calling the new Party() contructor directly
export function createParty(leader:Client):Party {
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

export function findParty(partyid: string):Party {
    return global.parties[partyid];
}

export function deleteParty(partyid:string):void {
    let party = global.parties[partyid];
    party.disband();

    delete global.parties[partyid];
}



export default class Party {
    partyid: string;
    members: Client[];
    leader: Client;

    constructor(leader:Client) {
        this.leader = leader;
        this.members = [];

        this.addMember(leader);
    }

    addMember(member: Client): void {
        if (!this.isMember(member)) {
            this.members.push(member);
            member.party = this;
        }
    }

    kickMember(member: Client): void {
        if (this.isLeader(member)) {
            if (this.members.length == 1) { // if no one else left
                this.leader = null;
            }
            else {
                // find the first member to become the new party leader
                this.leader = this.members.find(m => m != member);
            }
        }
        this.members.splice(this.members.indexOf(member), 1);
        member.party = null;
    }

    disband() {
        this.members.forEach(member => this.kickMember(member));
    }

    setLeader(leader: Client): void {
        this.leader = leader;
    }

    isLeader(member: Client): boolean {
        return this.leader == member;
    }
k
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


    getInfo():PartyInfo {
        return {
            partyid: this.partyid,
            members: this.members.map(m => m.name),
            leader: this.leader.name
        };
    }
};