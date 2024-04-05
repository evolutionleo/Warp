const AdmZip = require('adm-zip');
const path = require('path');
const fs = require('fs');

let curr_zip;
let curr_folder;
let curr_path;

let addFolder = (name) => {
    curr_zip.addLocalFolder(path.join(__dirname, '..', `${curr_folder}`, `${name}/`), `/${name}`);
}
let addFile = (name) => {
    curr_zip.addLocalFile(path.join(__dirname, '..', `${curr_folder}`, name), '');
}

const zip_ignore =  ['node_modules', 'package-lock.json', 'out'];

let addAll = (curr_path) => {
    fs.readdirSync(curr_path).forEach((file) => {
        if (zip_ignore.includes(file)) return;
    
        if (file.includes('.'))
            addFile(file);
        else
            addFolder(file);
    });
}

// TypeScript server
const ts_zip = new AdmZip();
curr_zip = ts_zip;
curr_folder = 'TypescriptServer';
curr_path = path.join(__dirname, '..', `${curr_folder}`);

addAll(curr_path);

ts_zip.writeZip('../Release/TSServer.zip');


// JavaScript server
const js_zip = new AdmZip();
curr_zip = js_zip;
curr_folder = 'JavascriptServer';
curr_path = path.join(__dirname, '..', `${curr_folder}`);

addAll(curr_path);

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