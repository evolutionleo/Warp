import Entity from '#concepts/entity';

export default class UnknownEntity extends Entity {
    static type = 'Unknown';
    static object_name = '';
    
    constructor(room, x, y) {
        throw new Error('Error! Trying to create an instance of UnknownEntity!');
        super(room, x, y);
    }
}
