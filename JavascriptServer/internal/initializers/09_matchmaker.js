import MatchMaker from "#util/matchmaker";

// start the matchmaking loop
MatchMaker._interval = setInterval(MatchMaker.process_matches, global.config.mm_process_interval);
