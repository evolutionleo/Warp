import UnknownEntity from '#entities/unknown';
import trace from '#util/logging';
import chalk from 'chalk';
import * as fs from 'fs';
import * as p from 'path';

// a couple utility functions
function isDir(path) {
    return fs.existsSync(path) && fs.statSync(path).isDirectory();
}

function isFile(path) {
    return fs.existsSync(path) && fs.statSync(path).isFile();
}

// the function
export default function LoadRoom(room_name) {
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
    
    const contents = [];
    
    // load an empty array
    if (!global.config.entities_enabled) {
        return { width, height, contents };
    }
    
    data.layers.forEach((layer) => {
        if (layer.instances) {
            layer.instances.forEach((inst) => {
                let props = {};
                inst.properties.forEach(p => props[p.propertyId.name] = p.value.replaceAll('\"', ''));
                
                let type = global.entity_objects[inst.objectId.name]?.type || UnknownEntity.type;
                
                contents.push({
                    obj: inst.objectId.name,
                    x: inst.x,
                    y: inst.y,
                    xs: inst.scaleX,
                    ys: inst.scaleY,
                    a: inst.rotation,
                    t: type,
                    spd: { x: 0, y: 0 },
                    p: props,
                    st: -1
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
