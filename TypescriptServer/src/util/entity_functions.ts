import Entity from '#concepts/entity';

export function entityExists(entityType: typeof Entity|string): boolean {
    return global.entities.includes(entityType as typeof Entity)
        || Object.keys(global.entity_objects).includes(entityType as string)
        || Object.keys(global.entity_names).includes(entityType as string);
}