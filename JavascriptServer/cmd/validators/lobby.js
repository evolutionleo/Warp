import { addValidator } from "#cmd/validator";

addValidator(['lobby info', 'lobby join'], {
    lobbyid: { type: 'string', optional: true }
});
