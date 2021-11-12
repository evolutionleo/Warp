import { appendFile } from 'fs';
function trace(...strs) {
    var str = '';
    for (var i = 0; i < strs.length; i++) {
        let s = strs[i];
        if (typeof s === 'object') {
            str += ' ' + JSON.stringify(s);
        }
        else {
            str += ' ' + s.toString();
        }
    }
    let datetime = new Date().toLocaleString();
    str = '[' + datetime + ']' + ' ' + str;
    appendFile('./../server_log.txt', str + '\n', () => { });
    console.log(str);
}
global.trace = trace;
export default trace;
