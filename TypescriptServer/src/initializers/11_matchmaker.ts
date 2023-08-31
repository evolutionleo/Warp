import MatchMaker from "#matchmaking/matchmaker";
import Queue from "#matchmaking/queue";

for(const gm in global.game_modes) {
    MatchMaker.queues[gm] = new Queue(gm);
}

// start the matchmaking loop
MatchMaker._interval = setInterval(MatchMaker.processMatches, global.config.matchmaking.process_interval);