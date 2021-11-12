import Entity from "#concepts/entity";
export default class UnknownEntity extends Entity {
    constructor(room, x, y) {
        throw "Error! Trying to create an instance of UnknownEntity!";
        super(room, x, y);
    }
}
UnknownEntity.type = "Unknown";
UnknownEntity.object_name = "";
