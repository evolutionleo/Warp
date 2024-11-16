import { addHandler } from "#cmd/handlePacket";
import Point from "#types/point";
import { clamp } from "#util/maths";


addHandler('player controls', (c, data) => {
    if (!c.entity) return;

    c.entity.inputs = {
        move: data.move as Point,
        kright: data.kright,
        kleft: data.kleft,
        kup: data.kup,
        kdown: data.kdown,

        kjump: data.kjump,
        kjump_rel: data.kjump_rel,
        kjump_press: data.kjump_press
    }

    c.entity.inputs.move.x = clamp(c.entity.inputs.move.x, -1, 1);
    c.entity.inputs.move.y = clamp(c.entity.inputs.move.y, -1, 1);
});

