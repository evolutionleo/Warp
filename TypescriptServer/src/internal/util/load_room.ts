import { SerializedEntity } from '#concepts/entity';
import UnknownEntity from '#entity/unknown';
import * as fs from 'fs';

export type LoadedRoom = {
    width:number,
    height:number,
    contents:SerializedEntity[]
}

export default function LoadRoom(path:string = './rooms/rTest.yy'):LoadedRoom {
    let json = fs.readFileSync(path).toString();
    let regex = /\,(?=\s*?[\}\]])/g; // remove trailing commans
    json = json.replace(regex, '');

    const data = JSON.parse(json);
    const width = data.roomSettings.Width;
    const height = data.roomSettings.Height;

    const contents:SerializedEntity[] = [];

    data.layers.forEach((layer) => {
        if (layer.instances) {
            layer.instances.forEach((inst) => {
                contents.push({
                    object_name: inst.objectId.name,
                    x: inst.x,
                    y: inst.y,
                    xscale: inst.scaleX,
                    yscale: inst.scaleY,
                    type: global.entityObjects[inst.objectId.name]?.type || UnknownEntity.type,
                    spd: {x: 0, y: 0}
                });
            });
        }
    });

    return {
        width,
        height,
        contents // entities
    };
}