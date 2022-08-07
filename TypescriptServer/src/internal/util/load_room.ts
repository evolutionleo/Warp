import { SerializedEntity } from '#concepts/entity';
import UnknownEntity from '#entity/unknown';
import trace from '#util/logging';
import chalk from 'chalk';
import * as fs from 'fs';
import * as p from 'path';

export type LoadedRoom = {
    width:number,
    height:number,
    contents:SerializedEntity[]
}

// a couple utility functions
function isDir(path:string) {
    return fs.existsSync(path) && fs.statSync(path).isDirectory();
}

function isFile(path:string) {
    return fs.existsSync(path) && fs.statSync(path).isFile();
}

// the function
export default function LoadRoom(room_name:string):LoadedRoom {
    let rooms_path = p.resolve(global.config.room.rooms_path) + '/';
    
    if (!isDir(rooms_path)) {
        trace(chalk.redBright('ERROR: config.room.rooms_path is not a directory! - ', rooms_path));
        return undefined;
    }

    let path = rooms_path + room_name;
    if (isDir(path)) { // if it's a gm project's "rooms" folder then there's an additional layer
        // check the uppercase variant, if it doesn't exist - use .toLowerCase()
        let new_path = path + '/' + room_name + '.yy';
        if (!fs.existsSync(new_path)) {
            new_path = path + '/' + room_name.toLowerCase() + '.yy';
        }

        path = new_path;
    }
    else {
        path += '.yy';
    }

    let json = fs.readFileSync(path).toString();
    let regex = /\,(?=\s*?[\}\]])/g; // remove trailing commas
    json = json.replace(regex, '');

    const data = JSON.parse(json);
    const width = data.roomSettings.Width;
    const height = data.roomSettings.Height;

    const contents:SerializedEntity[] = [];

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
                    spd: {x: 0, y: 0},
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