import Lobby from '#concepts/lobby';
declare module '#cmd/sendStuff' {
    interface SendStuff {
        sendLobbyJoin(lobby: Lobby): void;
        sendLobbyReject(lobby: Lobby, reason?: string): void;
        sendLobbyLeave(lobby: Lobby, reason?: string, forced?: boolean): void;
        sendLobbyUpdate(lobby: Lobby): void;
        sendLobbyInfo(lobbyid: string): void;
        sendLobbyList(): void;
    }
}
