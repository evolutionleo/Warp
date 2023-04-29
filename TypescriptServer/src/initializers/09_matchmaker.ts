import MatchMaker from "#util/matchmaker";

// start the matchmaking loop
MatchMaker._interval = setInterval(MatchMaker.processMatches, global.config.mm_process_interval);