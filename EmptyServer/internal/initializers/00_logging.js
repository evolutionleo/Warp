const fs = require('fs');

/*
    @function trace(*str)
    @param {String} *str
 */
global.trace = function(str) {
    str ??= '';
    str = str.toString();

    for(var i = 1; i < arguments.length; i++) {
        str += ' ' + arguments[i].toString();
    }

    let datetime = new Date().toLocaleString();
    str = '[' + datetime + ']' + ' ' + str;

    fs.writeFile(__dirname + '/server_log.txt', str);
    console.log(arguments);
}