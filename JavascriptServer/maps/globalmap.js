import GameMap from "#concepts/map";

// This is a global map that includes all levels in the game
// you can remove it if you don't need it
export default new GameMap({
    name: 'global',
    description: 'a map with all the levels in the game',
    game_mode: '',
    levels: Object.keys(global.levels)
});
