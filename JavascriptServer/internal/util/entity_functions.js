
export function entityExists(entityType) {
    return global.entities.includes(entityType)
        || Object.keys(global.entity_objects).includes(entityType)
        || Object.keys(global.entity_names).includes(entityType);
}
