import chalk from 'chalk';
import util from 'util';
import { appendFile } from 'fs';

declare global {
    namespace NodeJS {
        interface Global {
            trace: (str?:string) => void;
        }
    }
}

const dummy_function = () => {};
const styling_regex = /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g

function trace(...strs:any[]):void {
    var str = '';
    
    for(var i = 0; i < strs.length; i++) {
        let s = strs[i];
        if (typeof s === 'undefined') {
            str += 'undefined';
        }
        else if (typeof s === 'object') {
            str += ' ' + util.inspect(s);
        }
        else {
            str += ' ' + s.toString();
        }
    }

    let datetime = new Date().toLocaleString();
    str = '[' + datetime + ']' + ' ' + str;

    // console log
    console.log(str);

    if (global.config.logging_enabled) {
        // append to the log file, without any styling special characters
        recently_logged += str.replace(styling_regex, '') + '\n';
    }
}

var recently_logged:string = '';
setInterval(() => {
    appendFile('./server_log.txt', recently_logged, dummy_function);
    recently_logged = '';
}, 100);

global.trace = trace;
export default trace;