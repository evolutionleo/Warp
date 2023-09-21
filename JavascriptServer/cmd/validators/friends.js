import { addMiddleware } from "#cmd/middleware";
import { addValidator } from "#cmd/validator";
import { getProfileByName } from "#schemas/profile";


let friend_cmds = ['friend req accept', 'friend req reject', 'friend req send', 'friend add', 'friend remove', 'friend req cacnel'];

addValidator(friend_cmds, { name: 'string' });

addMiddleware(friend_cmds, async (c, data) => {
    let friend = await getProfileByName(data.name);
    
    if (friend) {
        data.friend = friend;
        return true;
    }
    else {
        c.sendError('Player not found', data.cmd);
        return false;
    }
});
