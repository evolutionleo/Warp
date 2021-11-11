import Entity from '#concepts/entity';

export function entityExists(entiyType: typeof Entity|string): boolean {
    return global.entities.includes(entiyType as typeof Entity)
        || Object.keys(global.entityObjects).includes(entiyType as string)
        || Object.keys(global.entityNames).includes(entiyType as string);
}