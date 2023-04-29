import trace from '#util/logging'
import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';

// this file isn't really meant to be touched, all you have to know is that
// basically all this does is just loading all the maps from the 'maps/' folder, that globals.maps is then set to

import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// __dirname is where this file is located
const maps_dir = path.join(__dirname, '../maps/');
global.maps = [];
const filenames = fs.readdirSync(maps_dir); // sync because CommonJS

trace(chalk.blueBright(`found maps: [${filenames.join(', ')}]`))

// load everything async/at the same time,
// but still waits until everything is loaded
await Promise.all(filenames.map((filename:string) => {
    return new Promise(async(resolve, reject) => {
        var this_map = await import("file://" + maps_dir + filename);
        this_map = this_map.default;

        global.maps.push(this_map);

        resolve(this_map);
    })
}))


export default global.maps