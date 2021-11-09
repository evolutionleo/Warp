import { appendFile } from 'fs';

declare global {
    namespace NodeJS {
        interface Global {
            trace: (str?:string) => void;
        }
    }
}

function trace(...strs:any[]):void {
    var str = '';
    
    for(var i = 0; i < strs.length; i++) {
        let s = strs[i];
        str += ' ' + s.toString();
    }

    let datetime = new Date().toLocaleString();
    str = '[' + datetime + ']' + ' ' + str;

    appendFile('./../server_log.txt', str + '\n', () => {});
    console.log(str);
}

global.trace = trace;
export default trace;