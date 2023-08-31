import trace from '#util/logging'
import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';

import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const gms_dir = path.join(__dirname, '../game_modes/');
global.game_modes = {};
const filenames = fs.readdirSync(gms_dir); // sync because CommonJS

trace(chalk.blueBright(`found game modes: [${filenames.join(', ')}]`))

await Promise.all(filenames.map((filename:string) => {
    return new Promise(async(resolve, reject) => {
        var gm = await import("file://" + gms_dir + filename);
        gm = gm.default;

        // find the maps for the game mode
        gm.levels = global.maps.filter((m) => m.game_mode === gm.name);

        if (global.game_modes[gm.name] !== undefined) {
            throw "Error! duplicate game mode name found: " + gm.name;
        }
        else {
            global.game_modes[gm.name] = gm;
        }

        resolve(gm);
    })
}))


export default global.game_modes;