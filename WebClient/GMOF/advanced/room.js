export class Room {
    canvas;
    ctx;
    entities;

    constructor() {
        /** @type {HTMLCanvasElement} canvas */
        this.canvas = document.getElementById('canvas');
        this.ctx = canvas.getContext('2d');
    
        this.entities = {} // id: entity
        // Object.values(entites)

        this.interval = setInterval(this.tick, 1000/config.tickrate);
    }

    spawnEntity(x, y, type) {

    }

    cleanUp() {
        clearInterval(this.interval);
    }

    tick() {
        Object.values(this.entities).forEach((e) => e.tick());
    }
}