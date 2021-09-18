
/**
 * 
 * @param {string} lobbyid 
 */
function sendJoinLobby(lobbyid) {
    client.send({ cmd: "lobby join", lobbyid: lobbyid })
}

function sendLeaveLobby() {
    client.send({ cmd: "lobby leave" })
}

function sendRequestLobby(lobbyid) {
    client.send({ cmd: "lobby info", lobbyid: lobbyid })
}

function sendRequestLobbies() {
    client.send({cmd: "lobby list" })
}

function sendHello() {
    client.send({ cmd: "hello", kappa: "haha websocket" })
}

/**
 * 
 * @param {string} username 
 * @param {string} password 
 */
function sendLogin(username, password) {
    client.send({ cmd: "login", username, password })
}


/**
 * 
 * @param {string} username 
 * @param {string} password 
 */
function sendRegister(username, password) {
    client.send({ cmd: "register", username, password })
}

