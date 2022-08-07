
export function entityExists(entityType) {
    return global.entities.includes(entityType)
        || Object.keys(global.entityObjects).includes(entityType)
        || Object.keys(global.entityNames).includes(entityType);
}
