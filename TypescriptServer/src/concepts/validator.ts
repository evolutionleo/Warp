import trace from '#util/logging';
import FastestValidator, { ValidationSchema } from 'fastest-validator'


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