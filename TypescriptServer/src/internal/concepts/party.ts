import Client from "./client";

export default class Party {
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

    kick(member: Client): void {
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
};