import { addValidator } from "#cmd/validator";

addValidator('match find', {
    req: {
        '$$type': 'object',
        game_mode: 'string'
    }
});
