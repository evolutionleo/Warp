import Entity from "#concepts/entity";
import Room from "#concepts/room";

export default class UnknownEntity extends Entity {
    static type = "Unknown";
    static object_name = "";

    constructor(room:Room, x:number, y:number) {
        throw "Error! Trying to create an instance of UnknownEntity!";
        super(room, x, y);
    }
}