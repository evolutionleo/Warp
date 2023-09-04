import MatchMaker from "#matchmaking/matchmaker";
import Queue from "#matchmaking/queue";
import trace from "#util/logging";


global.matchmaker = MatchMaker;

for(const gm in global.game_modes) {
    MatchMaker.queues[gm] = new Queue(gm);
}

if (global.config.matchmaking_enabled) {
    // start the matchmaking loop
    MatchMaker._interval = setInterval(() => {
        try {
            MatchMaker.processMatches();
        }
        catch(e) {
            trace(e);
        }
    }, global.config.matchmaking.process_interval);
}