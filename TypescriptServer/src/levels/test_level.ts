import GameLevel from '#concepts/level';

export default new GameLevel({
    name: 'Test Room',
    room_name: 'rTest',

    spawn_type: 'random',
    start_pos: [
        {x: 100, y: 100}
    ]
});
