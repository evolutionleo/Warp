
export function entityExists(entiyType) {
    return global.entities.includes(entiyType)
        || Object.keys(global.entityObjects).includes(entiyType)
        || Object.keys(global.entityNames).includes(entiyType);
}
