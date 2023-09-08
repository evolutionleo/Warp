import { addHandler } from "#cmd/handlePacket";

addHandler('name get', (c) => {
    c.sendName();
});

addHandler('login', (c, data) => {
    var { username, password } = data;
    c.tryLogin(username, password);
});

addHandler('register', (c, data) => {
    var { username, password } = data;
    c.tryRegister(username, password);
});
