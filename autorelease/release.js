const AdmZip = require('adm-zip');
const path = require('path');

// TypeScript server
const ts_zip = new AdmZip();
ts_zip.addLocalFolder(path.join(__dirname, '../TypescriptServer/src'), '/src');
ts_zip.addLocalFolder(path.join(__dirname, '../TypescriptServer/rooms'), '/rooms');
ts_zip.addLocalFile(path.join(__dirname, '../TypescriptServer/package.json'));
ts_zip.addLocalFile(path.join(__dirname, '../TypescriptServer/tsconfig.json'));
ts_zip.addLocalFile(path.join(__dirname, '../TypescriptServer/.gitignore'));
ts_zip.addLocalFile(path.join(__dirname, '../TypescriptServer/README.md'));

ts_zip.writeZip('../Release/TSServer.zip');


// JavaScript server
const js_zip = new AdmZip();
js_zip.addLocalFolder(path.join(__dirname, '../EmptyServer/custom'), '/custom');
js_zip.addLocalFolder(path.join(__dirname, '../EmptyServer/internal'), '/internal');
js_zip.addLocalFolder(path.join(__dirname, '../EmptyServer/maps'), '/maps');
js_zip.addLocalFile(path.join(__dirname, '../EmptyServer/package.json'));
js_zip.addLocalFile(path.join(__dirname, '../EmptyServer/.gitignore'));
js_zip.addLocalFile(path.join(__dirname, '../EmptyServer/server.js'));
js_zip.addLocalFile(path.join(__dirname, '../EmptyServer/config.js'));
js_zip.addLocalFile(path.join(__dirname, '../EmptyServer/README.md'));

js_zip.writeZip('../Release/JSServer.zip');


// JavaScript client
const gm_zip = new AdmZip();
gm_zip.addLocalFolder(path.join(__dirname, '../EmptyClient'));

gm_zip.writeZip('../Release/GMClient.zip');


// GameMaker client
const web_zip = new AdmZip();
web_zip.addLocalFolder(path.join(__dirname, '../JSClient'));

web_zip.writeZip('../Release/JSClient.zip');