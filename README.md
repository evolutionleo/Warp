# Warp (previously GM-Online-Framework)
#### A feature-rich framework for multiplayer games, written in GameMaker and Node.js
#### Maintained by [@evolutionleo](https://github.com/evolutionleo)
#### If you have any questions, please join my [Discord](https://discord.gg/WRsgumM2T6)


# Features
- **Simple API** to send/process packages on both server and client sides with a single line of code
- **No need to deal with buffers** whatsoever
- **Advanced systems:** server-side physics, entities, lobbies, account/profile system, saving/loading data with MongoDB
- **Well-commented source code** for better readability
- **NodeJS server** can run on a Linux hosting/dedicated server, as opposed to servers in GML
- **MIT license** (you can use Warp in commercial projects and contribute/modify it in any way)

# Examples (use old versions)
- [Chess Example](https://github.com/evolutionleo/ChessOnline) (uses v5.0)
- [Platformer Example](https://github.com/evolutionleo/StreamGame) (uses v3.0)
- [Pong Example](https://github.com/evolutionleo/GMOF-pong-example) (uses v3.0)

# Installing
## \[New!\] Client + Server
- You need to have [NodeJS](https://nodejs.org/en/) and [npm](https://npmjs.org) installed
- Install the package with `npm i -g @evoleo/create-warp-app`
- Run `npx create-warp-app`
- Select the client and server templates
- Done! The script will automatically bootstrap a new project from the [latest release](https://github.com/evolutionleo/Warp/releases/latest)

## Client-side
- Install .yymps from the [latest release](https://github.com/evolutionleo/Warp/releases/latest)
- Import it to your project using GameMaker's Local Package system *(you can also choose to include the Demo)*
 OR
- Install EmptyClient.zip and unzip it

## Server-side
- Install [NodeJS](https://nodejs.org/en/) (along with npm)
- Install [VS Code](https://code.visualstudio.com/) (or use any other code editor of your choice)
- (TypeScript) Install the [Typescript compiler](https://www.typescriptlang.org/) with `npm i -g typescript`
- Download JSServer.zip or TSServer.zip from the [latest release](https://github.com/evolutionleo/Warp/releases/latest)
- Open the clonned folder in the command line (or open the folder in VS Code)
- Run `npm install`


- (Optional) To use the accounts/saving system, install the database engine:

## Database \(Optional\)
- Install [MongoDB](https://www.mongodb.com/try/download/community)
- Choose the default settings, it should now run in the background
- Done!

## If you don't need MongoDB - please disable it in the server's config file (it's under common_config.db_enabled), otherwise you will get an error!


# Usage/Workflow
Congratulations on completing the Installation step!

Starting with netcode might be a bit overwhelming at first (even to experienced devs), which is why I tried to make implementing basic client/server interaction as simple and straightforward as possible:

## Sending a packet (JS/TS and GML)
Sending a message to the server might be as easy as:
```gml
send({ cmd: "hello", str: "Hello, Server!" })
```
or even (if you create a wrapper function):
```gml
sendHello()
```

## Receiving a packet

GML:
```gml
addHandler("hello", function(data) {
    show_debug_message(data.str)
})
```

JS/TS:
```js
addHandler("hello", (client, data) => {
    console.log(`${client.name} says: ${data.str}`)
})
```

## Using lobbies and maps:
- Add new maps in the `maps/` folder
- Choose how many lobbies you want to create initially in `initializers/04_lobbies.js`
- Use the commands `"lobby list"`, `"lobby join"`, `"lobby leave"` to work with lobbies
- Configure lobbies' behaviour inside the server's config file (under config.lobby)
- If you need any specific features for your game that aren't supported by existing configs,
- You can extend/change the `Lobby` class in `concepts/lobby.js` and the `Map` class in `concepts/map.js`

## Using entities and rooms:
- (You can always disable entities and rooms completely from `config.js` if you don't need the functionality for your game)
- Entity types are located inside `entities/entity_types/`, you can add new ones or modify/delete the existing ones
- Your custom entities generally should inherit from `PhysicsEntity` if they are moving and colliding with other entities, and from the regular `Entity` class otherwise
- You only need to code the entities behaviour logic once, on the server-side. The client will then interpolate between the data that it receives
- The `Entity.create()` and `Entity.update(dt)` methods function similarly to GameMaker's Create and Step events (except `tps` (the game's tickrate) is 20 by default as opposed to 60 in GM, and so it's recommended to use the `dt` (aka "delta time") parameter to implement your game physics in a tickrate-agnostic way)
- The `Entity.object_type` property links the server-side entities to GameMaker's instances/objects
- Rooms are automatically loaded with all the entities from GameMaker's .yy files from a path defined in `config.js` (by default it's a path to the `Client/rooms/` folder)

## Using accounts and saving:
- Make sure you installed MongoDB (instructions in the Installing section)
- Use the "register" and "login" commands on the client-side, the server will do all the authentification for you
- Info: "Account" is an object that holds a pair of login + password, and some data bound to them, while "Profile" is intended to hold the actual gameplay data. One Account could theoretically have many Profiles bound to it
- You can access the gameplay data of each client in `c.profile.%some_variable%`, it will save automatically
- If you want to add new properties, extend the schemas in the `schemas/` folder


# Running
- Client runs as a normal GMS2 project
- (TypeScript) Compile the server by running `npx tsc` (or `npx tsc -w` to avoid recompiling after every change)
- To start the server, navigate to its folder and run `node .` or `npm run dev` in the command line

# Configuration
- Edit the server configs inside `config.js`
- Edit the client configs inside `__NetworkingConfig.gml`
- Select the server config by appending `--env=prod` or `--env=dev` parameter to the `node .` command
- **Select the client config by clicking the 'target' button in the top-right corner of IDE**

# Deploying
- Install Node.js and npm
- Install and configure MongoDB if you're using it in your project
- Copy the JS/TS `Server` folder over, along with the `rooms/` folder from the GameMaker's project
- Navigate to the folder in command line
- Install all the necessary packages using `npm install`
- Run `npm run prod` or `node . --env=prod`
- (Optional) Use a tool like [PM2](https://pm2.keymetrics.io) for running the server in the background and managing the process
- Don't forget to change the client's config to "Prod" by clicking the target button in the top right corner of the IDE!


# Contributing
### Rules for submitting a PR:
- Please try to keep the coding style consistent with the rest of the project (e.x. use tabs instead of spaces, etc.)
- When modifying the server code - *please only edit the TypeScript version*, as it can be then automatically translated to JS, but not the other way around
- After you've made your changes to the TS server, go to /autorelease/ and run `npm run release` to compile everything to JS and create the .zip files in /Release/
- I only accept pull requests with new features that in my opinion make sense for the framework, so if you want to introduce a brand new feature, please lmk first (create a new issue or ask on Discord) because it could be either something that I don't want to be a part of Warp, or it already has an alternative, or it's just something that I'd want to implement myself
## Feature requests/typos/bug reports:
- Check if someone has already made an issue about your bug/feature on the [issues tab](https://github.com/evolutionleo/Warp/issues)
- If not, [open a new issue](https://github.com/evolutionleo/Warp/issues/new) detailing the bug that you found in Warp/the feature that you want to be implemented
- If it's a feature request, please write why it makes sense to include it/what problem it solves

# Credits
- [Messagepack](https://msgpack.org/) serialization format 
- [@jujuadams](https://github.com/jujuadams)'s [SNAP](https://github.com/jujuadams/snap) library, which enables Messagepack's encoding/decoding inside GameMaker
- [NodeJS Messagepack](https://github.com/msgpack/msgpack) encoder/decoder
- [rm2kdev's really old series on creating an MMO in GMS 1.4+Node.js that inspired all this](https://www.youtube.com/watch?v=EyNVeTzhC1w&list=PLLUWsMtogf9jQGzn3nAjAw2_aq3PM08pC)
- Pull request for the first TypeScript version: [@davawen](https://github.com/davawen)
- [@YellowAfterlife](https://github.com/yellowafterlife)'s [execute_shell_simple](https://yellowafterlife.itch.io/gamemaker-execute-shell-simple) extension
- Framework by: [@evolutionleo](https://github.com/evolutionleo) (me)
