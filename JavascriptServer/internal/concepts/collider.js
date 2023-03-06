import * as dc from 'detect-collisions';

export function _Collider(Base) {
    return class extends Base {
        entity;
    };
}

export const CircleCollider = _Collider(dc.Circle);
export const PolygonCollider = _Collider(dc.Polygon);
export const BoxCollider = _Collider(dc.Box);
