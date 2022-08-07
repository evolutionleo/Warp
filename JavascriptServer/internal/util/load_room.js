import UnknownEntity from '#entity/unknown';
import * as fs from 'fs';

export default function LoadRoom(path = './rooms/rTest.yy') {
    let json = fs.readFileSync(path).toString();
    let regex = /\,(?=\s*?[\}\]])/g; // remove trailing commas
    json = json.replace(regex, '');
    
    const data = JSON.parse(json);
    const width = data.roomSettings.Width;
    const height = data.roomSettings.Height;
    
    const contents = [];
    
    // load an empty array
    if (!global.config.entities_enabled) {
        return { width, height, contents };
    }
    
    data.layers.forEach((layer) => {
        if (layer.instances) {
            layer.instances.forEach((inst) => {
                // let props = inst.properties.map(p => ({
                //     name: p.propertyId.name,
                //     value: p.value
                // }));
                let props = {};
                inst.properties.forEach(p => props[p.propertyId.name] = p.value.replaceAll('\"', ''));
                
                contents.push({
                    object_name: inst.objectId.name,
                    x: inst.x,
                    y: inst.y,
                    xscale: inst.scaleX,
                    yscale: inst.scaleY,
                    type: global.entityObjects[inst.objectId.name]?.type || UnknownEntity.type,
                    spd: { x: 0, y: 0 },
                    props
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
