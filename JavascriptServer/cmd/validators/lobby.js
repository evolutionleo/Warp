import { addValidator } from "#concepts/validator";

addValidator(['lobby info', 'lobby join'], {
    lobbyid: { type: 'string', optional: true }
});
