import trace from '#util/logging';
import chalk from 'chalk';

async function cleanup() {
    await Promise.all(global.clients.map(c => c.save()));
    trace('saved all client data!');
}

async function onProcessExit(exitCode = undefined) {
    trace('Running onProcessExit()');
    
    if (exitCode !== undefined)
        trace('Exit code:', exitCode);
    
    trace('Running cleanup...');
    await cleanup();
    trace('Cleanup finished.');
    
    
    trace('Exiting the process...');
    process.exit();
}

// do something when app is closing
// process.on('exit', () => trace('Exited!'));

//catches ctrl+c event
process.on('SIGINT', onProcessExit);
process.on('SIGTERM', onProcessExit);
process.on('SIGHUP', onProcessExit);

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', onProcessExit);
process.on('SIGUSR2', onProcessExit);

// catches uncaught exceptions
process.on('uncaughtException', function (e) {
    trace(chalk.redBright(e.message));
    trace(chalk.redBright(e.stack ?? '(no callstack)'));
    onProcessExit();
});


process.stdin.resume();
