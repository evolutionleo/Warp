import trace from '#util/logging'
import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';

import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const maps_dir = path.join(__dirname, '../maps/');
global.maps = [];
const filenames = fs.readdirSync(maps_dir); // sync because CommonJS

trace(chalk.blueBright(`found maps: [${filenames.join(', ')}]`));

await Promise.all(filenames.map((filename:string) => {
    return new Promise(async(resolve, reject) => {
        var map = await import("file://" + maps_dir + filename);
        map = map.default;
        global.maps.push(map);

        resolve(map);
    })
}));


export default global.maps;