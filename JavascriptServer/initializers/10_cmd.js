import trace from '#util/logging';
import chalk from 'chalk';
import fs from 'fs';

import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));


async function loadFolder(type) {
    let dir = __dirname + `/../cmd/${type}s`;
    let files = fs.readdirSync(dir, 'utf8');
    trace(chalk.blueBright(`Loading ${type}s...`));
    
    // load everything asynchronously
    await Promise.all(files.map(file => {
        if (fs.statSync(dir + '/' + file).isDirectory())
            return;
        
        trace(chalk.blueBright(`> loading ${type}:`, file));
        return import(`file://${__dirname}/../cmd/${type}s/${file}`);
    }));
    
    trace(chalk.blueBright(`loaded ${type}s!`));
}

await Promise.all([
    loadFolder('validator'),
    loadFolder('handler'),
    loadFolder('sender')
]);
