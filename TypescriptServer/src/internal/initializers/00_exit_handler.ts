import Profile from '#schemas/profile';
import trace from '#util/logging';

async function cleanup() {
    await Profile.updateMany({}, { online: false, lastOnline: Date.now() });
}

async function onProcessExit(exitCode) {
    trace('Running onProcessExit()');

    if (exitCode !== undefined)
        trace('Exit code:', exitCode);

    trace('Running cleanup...');
    await cleanup();
    trace('Cleanup finished');
    
    trace('Exiting the process.');

    if (!this.noexit)
        process.exit();
}

//do something when app is closing
process.on('exit', onProcessExit.bind({ noexit: true }));

//catches ctrl+c event
process.on('SIGINT', onProcessExit);

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', onProcessExit);
process.on('SIGUSR2', onProcessExit);

// catches uncaught exceptions
process.on('uncaughtException', onProcessExit);