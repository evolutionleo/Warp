import trace from '#util/logging';
import * as readline from 'readline';

if (global.config.shell_enabled) {
    trace('starting the eval console...');
    
    const rl = readline.createInterface(process.stdin, process.stdout);
    rl.on('line', (line) => {
        try {
            console.log(eval(line));
        }
        catch (error) {
            console.error(error);
        }
    });
    rl.on('SIGINT', () => {
        process.exit();
    });
    trace('> type right into the console to execute JS code in real time <');
}
else {
    trace("not starting the eval console, since it's disabled");
}
