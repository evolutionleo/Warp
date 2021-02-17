# GM-Online-Framework
#### A simple, light-weight framework for multiplayer games, written in in GMS2.3 and NodeJS
#### Maintained by [@evolutionleo](https://github.com/evolutionleo)
# Features
- **Simple one-line calls** to send/process packages on both server and client sides
- **No need to deal with buffers** whatsoever
- **Well-commented code** if you decide to dive into the sources**
- **NodeJS server** can run on a Linux dedicated server
- **Open-source license** (you can use this in commercial projects and modify/contribute in any way)**
# Installing
### Client-side
- Install .yymps from the latest [release](https://github.com/evolutionleo/GM-Online-Framework/releases)
- Import it to your project using Local Package system

 OR
- Clone EmptyClient/
### Server-side
- Install [NodeJS](https://nodejs.org/en/)
- I recommend using [VS Code](https://code.visualstudio.com/), as it's **very cool** (and in addition to that it provides a handy command line, embedded into the code editor)
- Clone EmptyServer/
- Open up the clonned folder in command line (or open the folder in VS Code)
- Enter `npm install`

## Usage/Workflow
Congratulations if you've completed the Installation step!

Anyways. You see, many other networking frameworks might seem a bit overwhelming (even to people who are somewhat experienced in the topic).

That's why I tried my best to provide the simplest interface:
### Sending a packet
Sending a message to the server might be as easy as:
```gml
network_write({ cmd: "Hello", str: "Hello, Server!" })
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

## Runnning
- Client runs as a usual GMS2 project
- To start the server - navigate to the folder and execute `node server.js`

## Typescript Server
### Installing
- Follow the original steps, but clone TypescriptServer/ 
- Install the [Typescript compiler](https://www.typescriptlang.org/) with `npm i -g typescript`

### Networking

| | |
--------|------------
| Send command | Use the `Client.write` function or add a wrapper in the `Client`class |
| Recieve command | Add a case in the `handlePacket` function |

### Running
- Compile the project by running `tsc` or run `tsc -w` to avoid recompiling after every change
- Run `node .` or `node dist/server.js`
  

## Credits
- [Messagepack](https://msgpack.org/) serialization format 
- [@jujuadams](https://github.com/jujuadams)'s [SNAP](https://github.com/jujuadams/snap) library, which enables Messagepack's encoding/decoding inside GameMaker
- [NodeJS Messagepack](https://github.com/msgpack/msgpack) encoder/decoder
- Framework by: [@evolutionleo](https://github.com/evolutionleo) (me)
