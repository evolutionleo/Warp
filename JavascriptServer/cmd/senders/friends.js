import SendStuff from "#cmd/sendStuff";
import { getProfileInfo } from "#schemas/profile";


SendStuff.prototype.sendFriends = function (friends) {
    this.send({ cmd: 'friends', friends: friends.map(f => getProfileInfo(f)) });
};

SendStuff.prototype.sendIncomingFriendRequests = function (from_profiles) {
    this.send({ cmd: 'friend request inc', from: from_profiles });
};
