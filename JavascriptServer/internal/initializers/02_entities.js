// load everything into global.entities
// same as with 03_maps
import * as fs from 'fs';
import * as path from 'path';

import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const entities_dir = path.join(__dirname, '/../entities/entity_types/');
const filenames = fs.readdirSync(entities_dir); // sync because CommonJS



let entityNames = {};
let entityObjects = {};

if (!global.config.entities_enabled) {
    // don't load anything
}
else {
    
    await Promise.all(filenames.map((filename) => {
        return new Promise(async (resolve, reject) => {
            var entity = await import("file://" + entities_dir + filename);
            entity = entity.default;
            
            global.entities.push(entity);
            
            resolve(entity);
        });
    }));
    
    global.entities.forEach(entity => { entityNames[entity.type] = entity; });
    global.entityNames = entityNames;
    
    global.entities.forEach(entity => { entityObjects[entity.object_name] = entity; });
    global.entityObjects = entityObjects;
    
}

export { entityNames };
export { entityObjects };
export default global.entities;
