import SendStuff from "#cmd/sendStuff";
import { IProfile, ProfileInfo, getProfileInfo } from "#schemas/profile";

declare module '#cmd/sendStuff' {
    interface SendStuff {
        sendFriends(friends: IProfile[])
        sendIncomingFriendRequests(from_profiles: IProfile[])
        sendOutgoingFriendRequests(to_profiles: IProfile[])
        sendNewFriendRequest(from_profile:IProfile)
    }
}


SendStuff.prototype.sendFriends = function(friends:IProfile[]) {
    this.send({ cmd: 'friend list', friends: friends.map(f => getProfileInfo(f)) });
}

SendStuff.prototype.sendIncomingFriendRequests = function(from_profiles:IProfile[]) {
    this.send({ cmd: 'friend req inc', from: from_profiles.map(f => getProfileInfo(f)) });
}

SendStuff.prototype.sendOutgoingFriendRequests = function(to_profiles:IProfile[]) {
    this.send({ cmd: 'friend req out', to: to_profiles.map(f => getProfileInfo(f)) });
}

SendStuff.prototype.sendNewFriendRequest = function(from_profile:IProfile) {
    this.send({ cmd: 'friend req new', from: getProfileInfo(from_profile) });
}