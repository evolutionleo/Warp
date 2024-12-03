import { addValidator } from "#cmd/validator";

addValidator(['lobby info', 'lobby join'], {
    lobby_id: { type: 'string', optional: true }
});