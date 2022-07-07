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
js_zip.addLocalFolder(path.join(__dirname, '../JavascriptServer/custom'), '/custom');
js_zip.addLocalFolder(path.join(__dirname, '../JavascriptServer/internal'), '/internal');
js_zip.addLocalFolder(path.join(__dirname, '../JavascriptServer/maps'), '/maps');
js_zip.addLocalFolder(path.join(__dirname, '../JavascriptServer/rooms'), '/rooms');
js_zip.addLocalFile(path.join(__dirname, '../JavascriptServer/package.json'));
js_zip.addLocalFile(path.join(__dirname, '../JavascriptServer/.gitignore'));
js_zip.addLocalFile(path.join(__dirname, '../JavascriptServer/server.js'));
js_zip.addLocalFile(path.join(__dirname, '../JavascriptServer/config.js'));
js_zip.addLocalFile(path.join(__dirname, '../JavascriptServer/README.md'));

js_zip.writeZip('../Release/JSServer.zip');


// GameMaker client
const gm_zip = new AdmZip();
gm_zip.addLocalFolder(path.join(__dirname, '../EmptyClient'));

gm_zip.writeZip('../Release/GMClient.zip');
gm_zip.writeZip('../Release/Warp.yymps');


// JavaScript client
const web_zip = new AdmZip();
web_zip.addLocalFolder(path.join(__dirname, '../WebClient'));

web_zip.writeZip('../Release/WebClient.zip');