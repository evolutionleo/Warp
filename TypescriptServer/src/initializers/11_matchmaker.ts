import MatchMaker from "#matchmaking/matchmaker";
import Queue from "#matchmaking/queue";
import trace from "#util/logging";


global.matchmaker = MatchMaker;

for(const gm in global.game_modes) {
    global.matchmaker.queues[gm] = new Queue(gm);
}

if (global.config.matchmaking_enabled) {
    // start the matchmaking loop
    global.matchmaker._interval = setInterval(() => {
        try {
            global.matchmaker.processMatches();
        }
        catch(e) {
            trace(e);
        }
    }, global.config.matchmaking.process_interval);
}