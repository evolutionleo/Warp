import GameMap from '#internal/concepts/map';

export default new GameMap({
    name: 'Stress Test',
    room_name: 'rStressTest',
    description: 'A stress test map',

    width: 1366,
    height: 768,

    // content_string: '',

    spawn_type: 'random',
    start_pos: [
        {x: 100, y: 100}
    ],
    max_players: 99
});
