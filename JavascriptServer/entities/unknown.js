import Entity from "#concepts/entity";

export default class UnknownEntity extends Entity {
    static type = "UnknownEntity";
    static object_name = "oUnknownEntity";
    
    type = 'UnknownEntity';
    object_name = 'oUnknownEntity';
    
    constructor(room, x, y) {
        throw "Error! Trying to create an instance of UnknownEntity!";
        super(room, x, y);
    }
}
