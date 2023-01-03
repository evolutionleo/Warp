
export default class Party {
    members;
    leader;
    
    constructor(leader) {
        this.leader = leader;
        this.members = [];
        
        this.addMember(leader);
    }
    
    addMember(member) {
        if (!this.isMember(member)) {
            this.members.push(member);
            member.party = this;
        }
    }
    
    kick(member) {
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
        this.members.forEach(member => this.kick(member));
    }
    
    setLeader(leader) {
        this.leader = leader;
    }
    
    isLeader(member) {
        return this.leader == member;
    }
    k;
    isMember(client) {
        return this.members.includes(client);
    }
    
    getAvgMMR() {
        if (this.members.length == 0)
            return 0;
        return this.members.reduce((v, m) => v + m.mmr, 0) / this.members.length;
    }
}
;
