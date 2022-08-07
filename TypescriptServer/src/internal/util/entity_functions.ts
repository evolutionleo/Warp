import Entity from '#concepts/entity';

export function entityExists(entityType: typeof Entity|string): boolean {
    return global.entities.includes(entityType as typeof Entity)
        || Object.keys(global.entityObjects).includes(entityType as string)
        || Object.keys(global.entityNames).includes(entityType as string);
}