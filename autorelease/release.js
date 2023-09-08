const AdmZip = require('adm-zip');
const path = require('path');

let curr_zip;
let curr_folder;

let addFolder = (name) => {
    curr_zip.addLocalFolder(path.join(__dirname, '..', `${curr_folder}`, `${name}/`), `/${name}`);
}
let addFile = (name) => {
    curr_zip.addLocalFile(path.join(__dirname, '..', `${curr_folder}`, name), '');
}

// TypeScript server
const ts_zip = new AdmZip();
curr_zip = ts_zip;
curr_folder = 'TypescriptServer';
addFolder('src');

addFile('package.json');
addFile('tsconfig.json');
addFile('jsconfig.json');
addFile('.gitignore');
addFile('README.md');

ts_zip.writeZip('../Release/TSServer.zip');


// JavaScript server
const js_zip = new AdmZip();
curr_zip = js_zip;
curr_folder = 'JavascriptServer'

addFolder('cmd');
addFolder('maps');
addFolder('util');
addFolder('schemas');
addFolder('concepts');
addFolder('entities');
addFolder('initializers');


addFile('package.json');
addFile('jsconfig.json');

addFile('.gitignore');
addFile('README.md');

addFile('server.js');
addFile('config.js');
addFile('packet.js');

js_zip.writeZip('../Release/JSServer.zip');


// GameMaker client
const gm_zip = new AdmZip();
gm_zip.addLocalFolder(path.join(__dirname, '../Client'));

gm_zip.writeZip('../Release/GMClient.zip');
gm_zip.writeZip('../Release/Warp.yymps');


// JavaScript client
const web_zip = new AdmZip();
web_zip.addLocalFolder(path.join(__dirname, '../WebClient'));

web_zip.writeZip('../Release/WebClient.zip');