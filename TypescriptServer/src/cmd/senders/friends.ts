import SendStuff from "#cmd/sendStuff";
import { IProfile, ProfileInfo, getProfileInfo } from "#schemas/profile";

declare module '#cmd/sendStuff' {
    interface SendStuff {
        sendFriends(friends: IProfile[])
        sendIncomingFriendRequests(from_profiles: ProfileInfo[])
    }
}


SendStuff.prototype.sendFriends = function(friends:IProfile[]) {
    this.send({ cmd: 'friends', friends: friends.map(f => getProfileInfo(f)) });
}

SendStuff.prototype.sendIncomingFriendRequests = function(from_profiles:ProfileInfo[]) {
    this.send({ cmd: 'friend request inc', from: from_profiles });
}