import { addHandler } from "#cmd/handlePacket";
import Point from "#types/point";
import { clamp } from "#util/maths";

addHandler('player controls', (c, data) => {
    if (!c.entity) return;

    for(let input_name in c.entity.inputs) {
        if (data[input_name] !== undefined)
            c.entity.inputs[input_name] = data[input_name];
    }
});