import GameMap from '#concepts/map';

export default new GameMap({
    name: 'Test Room',
    room_name: 'rTest',
    description: 'A test map, a placeholder if you will',
    
    width: 1366,
    height: 768,
    
    // content_string: '',
    
    spawn_type: 'random',
    start_pos: [
        { x: 100, y: 100 }
    ],
    max_players: 99
});
