import { addValidator } from "#concepts/validator";

addValidator('match find', {
    req: {
        '$$type': 'object',
        game_mode: 'string'
    }
});