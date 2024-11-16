// load everything into global.entities
// same as with 03_levels
import trace from '#util/logging';
import * as fs from 'fs';
import * as path from 'path';

import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const entities_dir = path.join(__dirname, '/../entities/');
const filenames = fs.readdirSync(entities_dir); // sync because CommonJS



let entity_names = {};
let entity_objects = {};

if (!global.config.entities_enabled) {
    // don't load anything
}
else {

await Promise.all(filenames.map((filename:string) => {
    if (filename == 'entity.js') return null;

    return new Promise(async(resolve, reject) => {
        let entity = await import("file://" + entities_dir + filename);
        entity = entity.default;

        global.entities.push(entity);

        resolve(entity);
    });
}));

global.entities.forEach(entity => { entity_names[entity.type] = entity });
global.entity_names = entity_names;

global.entities.forEach(entity => { entity_objects[entity.object_name] = entity });
global.entity_objects = entity_objects;

}

export { entity_names };
export { entity_objects };
export default global.entities;