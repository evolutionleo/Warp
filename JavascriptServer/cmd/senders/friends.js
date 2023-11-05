import SendStuff from "#cmd/sendStuff";
import { getProfileInfo } from "#schemas/profile";


SendStuff.prototype.sendFriends = function (friends) {
    this.send({ cmd: 'friend list', friends: friends.map(f => getProfileInfo(f)) });
};

SendStuff.prototype.sendIncomingFriendRequests = function (from_profiles) {
    this.send({ cmd: 'friend req inc', from: from_profiles.map(f => getProfileInfo(f)) });
};

SendStuff.prototype.sendOutgoingFriendRequests = function (to_profiles) {
    this.send({ cmd: 'friend req out', to: to_profiles.map(f => getProfileInfo(f)) });
};

SendStuff.prototype.sendNewFriendRequest = function (from_profile) {
    this.send({ cmd: 'friend req new', from: getProfileInfo(from_profile) });
};
