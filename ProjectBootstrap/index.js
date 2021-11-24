#!/usr/bin/env node

const inquirer = require("inquirer");
const shell = require("shelljs");
const chalk = require('chalk');
const https = require('follow-redirects').https;
const fs = require('fs');
const unzipper = require('unzipper');

shell.config.silent = true;


const projectNameQuestion = [{
    type: "input",
    name: "projectName",
    message: "What's your project name?",
    default: "Empty"
}];

const questions = [
    {
        type: "list",
        name: "serverTemplate",
        message: "Select server-side template:",
        choices: ["Empty", "TypeScript", "Old Empty"]
    },
    {
        type: "list",
        name: "clientTemplate",
        message: "Select client-side template:",
        choices: ["GameMaker", "JavaScript (experimental)"]
    }
];


inquirer.prompt(projectNameQuestion).then(({ projectName }) => {

if (fs.existsSync(projectName)) {
    if (fs.readdirSync(projectName).length > 0) {
        console.log(chalk.red(`Directory "${projectName}/" already exists and is not empty!`));
        process.exit(1);
    }
}
else {
    fs.mkdirSync(projectName);
}

shell.cd(projectName); // actually navigates


inquirer.prompt(questions).then(answers => {
    const { serverTemplate, clientTemplate } = answers;
    const json = shell.exec('curl -s https://api.github.com/repos/evolutionleo/gm-online-framework/releases/latest');
    const data = JSON.parse(json);
    /** @type string[] */
    const assets = data.assets.map(asset => asset.browser_download_url);
    // console.log(assets);

    let server_fname = undefined;
    switch(serverTemplate) {
        case 'Empty':
            server_fname = 'JSServer.zip'
            break;
        case 'TypeScript':
            server_fname = 'TSServer.zip'
            break;
        case 'Old Empty':
            server_fname = 'JSServerOld.zip'
            break;
        default:
            throw new Error('Unknown Server Template: ' + serverTemplate);
    }

    const server_url = assets.find(assets => assets.endsWith(server_fname));
    if (!server_url) {
        console.log(chalk.red(`Failed to find the chosen client template in the latest release (${server_fname})`));
        process.exit(1);
    }

    
    let client_fname = undefined;
    switch(clientTemplate) {
        case 'GameMaker':
            client_fname = 'GMClient.zip';
            break;
        case 'JavaScript (experimental)':
            client_fname = 'JSClient.zip';
            break;
        default:
            throw new Error('Unknown Client Template: ' + serverTemplate);
    }

    const client_url = assets.find(assets => assets.endsWith(client_fname));
    if (!client_url) {
        console.log(chalk.red(`Failed to find the chosen client template in the latest release (${client_fname})`));
        process.exit(1);
    }

    
    // server
    const server_cb = () => {
        console.log(chalk.white('Unzipping ' + server_fname + '...'));
        fs.createReadStream(server_fname)
        .pipe(unzipper.Extract({ path: 'Server/' })
        .on('close', () => {
            console.log(chalk.white('Done.'));
            shell.rm('-rf', server_fname);
        }));
    };

    const server_file = fs.createWriteStream(server_fname);
    const server_req = https.get(server_url);

    console.log(chalk.white('Downloading the server from'), chalk.blueBright(server_url) + chalk.white('...'));
    server_req.on('response', (res) => {
        res.pipe(server_file);
        res.on('close', server_cb);
    });



    // client
    const client_cb = () => {
        console.log(chalk.white('Unzipping ' + client_fname + '...'));
        fs.createReadStream(client_fname)
        .pipe(unzipper.Extract({ path: 'Client/' })
        .on('close', () => {
            console.log(chalk.white('Done.'));
            shell.rm('-rf', client_fname);
        }));
    };

    const client_file = fs.createWriteStream(client_fname);
    const client_req = https.get(client_url);

    console.log(chalk.white('Downloading the client from'), chalk.blueBright(client_url) + chalk.greenBright('...'));
    client_req.on('response', (res) => {
        res.pipe(client_file);
        res.on('close', client_cb);
    });
})
});