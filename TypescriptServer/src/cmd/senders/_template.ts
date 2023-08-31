import SendStuff from "#cmd/sendStuff";

declare module '#cmd/sendStuff' {
    interface SendStuff {
        // sendSomething()
    }
}

/**
 * @param {}
 */
// SendStuff.prototype.sendSomething = function() {
//     this.send({ cmd: '',  })
// }