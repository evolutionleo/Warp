import { addValidator } from "#cmd/validator";

addValidator(['party join'], {
    party_id: 'string'
});
