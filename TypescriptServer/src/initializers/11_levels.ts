import trace from '#util/logging'
import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';

// this file isn't really meant to be touched, all you have to know is that
// basically all this does is just loading all the levels from the 'levels/' folder, that globals.levels is then set to

import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// __dirname is where this file is located
const levels_dir = path.join(__dirname, '../levels/');
global.levels = {};
const filenames = fs.readdirSync(levels_dir); // sync because CommonJS

trace(chalk.blueBright(`found levels: [${filenames.join(', ')}]`))

// load everything async/at the same time,
// but still waits until everything is loaded
await Promise.all(filenames.map((filename:string) => {
    return new Promise(async(resolve, reject) => {
        let this_level = await import("file://" + levels_dir + filename);
        this_level = this_level.default;

        let name = this_level.name;
        if (global.levels[name] !== undefined) {
            throw `Error: Level with the name "${name}" already exists!`;
        }


        global.levels[name] = this_level;

        resolve(this_level);
    })
}));


export default global.levels;