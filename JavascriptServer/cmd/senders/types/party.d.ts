import Party from "#concepts/party";
declare module '#cmd/sendStuff' {
    interface SendStuff {
        sendPartyInvite(party: Party): any;
        sendPartyLeave(party: Party, reason: string, forced: boolean): any;
        sendPartyJoin(party: Party): any;
        sendPartyReject(party?: Party, reason?: string): any;
        sendPartyInviteSent(): any;
    }
}
