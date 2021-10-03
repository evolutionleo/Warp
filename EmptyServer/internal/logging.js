const fs = require('fs');

/**
    @function trace([str])
    @param {...string} [str]
 */
global.trace = function(...strs) {
    let str = strs.map((s) => s.toString()).join(' ');

    let datetime = new Date().toLocaleString();
    str = '[' + datetime + ']' + ' ' + str;

    fs.appendFile(__dirname + '/../server_log.txt', str + '\n', () => {});
    console.log(str);
}