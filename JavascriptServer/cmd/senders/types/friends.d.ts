import { IProfile, ProfileInfo } from "#schemas/profile";
declare module '#cmd/sendStuff' {
    interface SendStuff {
        sendFriends(friends: IProfile[]): any;
        sendIncomingFriendRequests(from_profiles: ProfileInfo[]): any;
    }
}
