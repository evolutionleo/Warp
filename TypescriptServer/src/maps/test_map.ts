import trace from '#internal/logging';
import GameMap from '#entities/map';

export default new GameMap({
    name: 'Test Map',
    room_name: 'rTest',
    description: 'A test map, a placeholder if you will',

    mode: 'pvp',
    start_pos: [
        {x: 15, y: 320},
        {x: 700, y: 320}
    ],
    max_players: 2
})