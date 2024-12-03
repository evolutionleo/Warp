import trace from '#util/logging';
import * as readline from 'readline';

if (global.config.shell_enabled) {
    trace('starting the eval console...');

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.on('line', async (line) => {
        try {
            let result = eval(line);
            while (result instanceof Promise) {
                result = await result;
            }
            console.log(result);
        }
        catch(error) {
            console.error(error);
        }
    });
    rl.on('SIGINT', () => {
        process.emit('SIGINT');
    });
    trace('> type right into the console to execute JS code in real time <');
}
else {
    trace("not starting the eval console, since it's disabled")
}