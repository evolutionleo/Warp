import Entity from '#concepts/entity'
import * as dc from 'detect-collisions'

type Constructor<T = {}> = new (...args: any[]) => T;

export function _Collider<T extends Constructor<dc.BodyProps>>(Base: T) {
    return class extends Base {
        entity: Entity;
    }
}

export const CircleCollider = _Collider(dc.Circle);
export const PolygonCollider = _Collider(dc.Polygon);
export const BoxCollider = _Collider(dc.Box);

export type Collider = dc.Body & { entity: Entity };