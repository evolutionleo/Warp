# Warp (previously GM-Online-Framework)
#### A feature-rich framework for multiplayer games, written in GameMaker and NodeJS
#### Maintained by [@evolutionleo](https://github.com/evolutionleo)
#### If you have any questions, please join my [Discord](https://discord.gg/WRsgumM2T6)


# Features
- **Simple one-line calls** to send/process packages on both server and client sides
- **No need to deal with buffers** whatsoever
- **Advanced features:** server-side physics, entities, lobbies, account/profile system, saving/loading data with MongoDB
- **Well-commented code** if you decide to dive into the sources
- **NodeJS server** can run on a Linux hosting/dedicated server, as opposed to servers in GML
- **MIT license** (you can use this framework in commercial projects and modify/contribute in any way)

# Examples (use old versions)
- [Platformer Example](https://github.com/evolutionleo/StreamGame)
- [1v1 Pong Example](https://github.com/evolutionleo/GMOF-pong-example)

# Installing
### \[New!\] Client + Server
- You need to have [NodeJS](https://nodejs.org/en/) and [npm](https://npmjs.org) installed
- Install the packet with `npm i -g @evoleo/create-warp-app`
- Run `npx create-warp-app`
- Follow the instructions, select the templates for the Client and the Server
- Done! It will automatically pull everything from the [latest release](https://github.com/evolutionleo/Warp/releases/latest)


### Client-side
- Install .yymps from the [latest release](https://github.com/evolutionleo/Warp/releases/latest)
- Import it to your project using Local Package system *(you can also choose to include the Demo)*

 OR
- Clone EmptyClient/ or Releases/EmptyClient.zip
### Server-side
- Install [NodeJS](https://nodejs.org/en/)
- I recommend using [VS Code](https://code.visualstudio.com/), as it's **very cool** (and in addition to that it provides a handy command line, embedded into the code editor)
- Download JSServer.zip from the [latest release](https://github.com/evolutionleo/Warp/releases/latest)
- Open up the clonned folder in command line (or open the folder in VS Code)
- Run `npm install`

- (Optional) To use the accounts/saving system, install the database engine:

### Database \(Optional\)
- Install [MongoDB](https://www.mongodb.com/try/download/community)
- Choose the default settings, it should now run in background
- Done!

## If you don't need MongoDB - please disable it in the config file (it's under common_config.db_enabled), otherwise you will get an error!


## Usage/Workflow
Congratulations if you've completed the Installation step!

Anyways. You see, many other networking frameworks might seem a bit overwhelming (even to people who are somewhat experienced in the topic).

And even though versions from v3.0 and above of the framework did add some advanced features, I still tried my best to provide the simplest interface for the basic packet sending/receiving:
### Sending a packet (JS and GML)
Sending a message to the server might be as easy as:
```gml
send({ cmd: "Hello", str: "Hello, Server!" })
```
or even:
```gml
sendHello()
```
if you write a wrapper

### Adding a new command:

|        | Sends | Receives |
|--------|:-------:|:----------:|
| Client | Add a new function in SendStuff.gml| Add a new case in HandlePacket.gml |
| Server | Add a new function in SendStuff.js | Add a new case in HandlePacket.js |

### (Advanced) Using lobbies and maps:
- Add new maps in the `maps/` folder
- Choose how many lobbies you need in `initializers/04_lobbies.js`
- Use `"lobby list"`, `"lobby join"`, `"lobby leave"` to work with lobbies
- Most of the generic logic is already coded, but you can add in features that you personally need
- You can extend the `Lobby` class in `concepts/lobby.js`, the `Map` class in `concepts/map.js`

### (Advanced) Using accounts and saving:
- Make sure you installed MongoDB (instructions in the Installing section)
- Use the "register" and "login" commands on the client-side, the server will do all the authentification for you
- Info: "Account" is an object that holds a pair of login + password, and some data bound to them, while "Profile" holds the actual gameplay data. One Account can theoretically have many profiles bound to it
- You can access the gameplay data of each client in `c.profile.%insert_variable%`, it will save automatically
- If you want to add new properties, extend the schemas in the `schemas/` folder

## Runnning
- Client runs as a usual GMS2 project
- To start the server - navigate to the folder and execute `node .` 

## Configuration
- Edit the server configs inside `config.js`
- Edit the client configs inside `__NetworkingConfig.gml`
- Select the server config by adding `--env=prod` or `--env=dev` parameter to the classic `node .` command
- **Select the client config by clicking the 'target' button in the top-right corner of IDE**

## Typescript Server
### Installing
- Follow the original steps, but install TSServer.zip instead of JSServer.zip
- Install the [Typescript compiler](https://www.typescriptlang.org/) with `npm i -g typescript`

### Networking

| | |
--------|------------
| Send command | Use the `Client.send` function or add a wrapper in `custom/sendStuff.ts` |
| Recieve command | Add a case in `custom/handlePacket.ts` |

### Running
- Compile the project by running `npx tsc` or run `npx tsc -w` to avoid recompiling after every change
- Run `node .` or `node out/server.js`


## Contributing
### I accept pull requests with bug fixes/new features that make sense for the framework. Here are some rules for submitting a PR:
- Please try to keep the coding style consistent with the rest of the project (e.x. use tabs instead of spaces, etc.)
- When modifying the server code - *please only edit the TypeScript version*, as it can be then automatically translated to JS, but not the other way around
- After you've made your changes to the TS server, go to /autorelease/ and run `npm run release` to compile everything to JS and create the .zip files in /Release/
- If you want to introduce a brand new feature, please lmk first (create a new issue) because it could be either something that I don't want to be a part of Warp, or it already has an alternative, or it's just something that I'd want to implement myself
### Feature requests/typos/bug reports:
- Check if someone has already made an issue about your bug/feature on the [issues tab](https://github.com/evolutionleo/Warp/issues)
- If not, [open a new issue](https://github.com/evolutionleo/Warp/issues/new) detailing the bug that you found in Warp/the feature that you want to be implemented
- If it's a feature request, please write why it makes sense to include it/what problem it solves

# Credits
- [Messagepack](https://msgpack.org/) serialization format 
- [@jujuadams](https://github.com/jujuadams)'s [SNAP](https://github.com/jujuadams/snap) library, which enables Messagepack's encoding/decoding inside GameMaker
- [NodeJS Messagepack](https://github.com/msgpack/msgpack) encoder/decoder
- [rm2kdev's ancient series that inspired all this](https://www.youtube.com/watch?v=EyNVeTzhC1w&list=PLLUWsMtogf9jQGzn3nAjAw2_aq3PM08pC)
- Pull request for the first TypeScript version: [@davawen](https://github.com/davawen)
- Framework by: [@evolutionleo](https://github.com/evolutionleo) (me)
