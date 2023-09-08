import trace from '#util/logging';
import FastestValidator, { AsyncCheckFunction, SyncCheckFunction, ValidationSchema } from 'fastest-validator'

export type ValidatorFunction = SyncCheckFunction | AsyncCheckFunction;

export function createValidator(schema:ValidationSchema) {
    let v = new FastestValidator();
    return v.compile(schema);
}

export function addValidator(cmd:string|string[], schema:ValidationSchema) {
    if (Array.isArray(cmd)) {
        for(let _cmd of cmd) {
            addValidator(_cmd, schema);
        }
    }
    else {
        let v = createValidator(schema);
        global.cmd_validators[cmd] = v;
        return v;
    }
}

export const Validator = FastestValidator;