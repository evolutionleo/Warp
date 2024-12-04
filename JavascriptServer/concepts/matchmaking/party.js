import MatchMaker from "#matchmaking/matchmaker";
import { getRandomId } from "#util/random_id";

// use this instead of calling the new Party() contructor directly
export function partyCreate(leader) {
    let party_id = getRandomId(global.parties);
    if (party_id === null)
        return null;
    
    let party = new Party(leader);
    
    global.parties[party_id] = party;
    party.party_id = party_id;
    
    return party;
}

export function partyGet(party_id) {
    return global.parties[party_id];
}

export function partyExists(party_id) {
    return global.parties.hasOwnProperty(party_id);
}

export function partyDelete(party_id) {
    let party = global.parties[party_id];
    party.disband();
}


export default class Party {
    party_id;
    members;
    leader;
    max_members; // inherited from config.party.max_members
    
    get party_size() { return this.members.length; }
    
    ticket = null; // current matchmaking ticket (null = not looking for a match)
    match = null;
    
    constructor(leader) {
        this.members = [];
        this.max_members = global.config.party.max_members;
        
        this.leader = leader;
        this.addMember(leader);
        
        this.send();
    }
    
    addMember(member) {
        if (member.party === this)
            return;
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
    
    kickMember(member, reason = '', forced = true) {
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
    
    delete() {
        delete global.parties[this.party_id];
    }
    
    matchMakingStart(req) {
        if (this.ticket !== null)
            return 'already matchmaking';
        if (this.match !== null)
            return 'already in a match';
        
        this.ticket = MatchMaker.createTicket(this, req);
        
        // failed to create a ticket
        if (this.ticket === null) {
            return 'unable to start matchmaking';
        }
        
        return this.ticket;
    }
    
    matchMakingStop() {
        if (this.ticket === null)
            return;
        
        this.ticket.remove();
        this.ticket = null;
    }
    
    setLeader(leader) {
        this.leader = leader;
    }
    
    isLeader(member) {
        return this.leader == member;
    }
    
    isMember(client) {
        return this.members.includes(client);
    }
    
    getAvgMMR() {
        if (this.members.length == 0)
            return 0;
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
    
    
    getInfo() {
        return {
            party_id: this.party_id,
            members: this.members.map(m => m.name),
            leader: this.leader?.name
        };
    }
}
;
