import { addValidator } from "#cmd/validator";

addValidator(['party join'], {
    partyid: 'string'
});
