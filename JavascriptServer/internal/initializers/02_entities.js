// load everything into global.entities
// same as with 02_maps
import * as fs from 'fs';
import * as path from 'path';

import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const entities_dir = path.join(__dirname, '/../entities/entity_types/');
const filenames = fs.readdirSync(entities_dir); // sync because CommonJS

await Promise.all(filenames.map((filename) => {
    return new Promise(async (resolve, reject) => {
        var entity = await import("file://" + entities_dir + filename);
        entity = entity.default;
        
        global.entities.push(entity);
        
        resolve(entity);
    });
}));

let entityNames = {};
global.entities.forEach(entity => { entityNames[entity.type] = entity; });
export { entityNames };
global.entityNames = entityNames;

let entityObjects = {};
global.entities.forEach(entity => { entityObjects[entity.object_name] = entity; });
export { entityObjects };
global.entityObjects = entityObjects;

export default global.entities;
