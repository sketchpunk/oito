import Vec3 from '../Vec3.js';
import type Ray from './Ray.js';
declare class RayBBoxResult {
    tMin: number;
    tMax: number;
    entryAxis: number;
    entryNorm: number;
    exitAxis: number;
    exitNorm: number;
    getEntryNorm(out: Vec3, scl?: number): Vec3;
    getExitNorm(out: Vec3, scl?: number): Vec3;
}
declare class AABBRay {
    vecLenInv: Vec3;
    dir: number[];
    constructor(ray?: Ray);
    fromRay(ray: Ray): void;
}
declare class BoundingBox {
    bounds: Vec3[];
    constructor(min?: TVec3, max?: TVec3);
    get min(): Vec3;
    set min(v: TVec3);
    get max(): Vec3;
    set max(v: TVec3);
    setBounds(min: TVec3, max: TVec3): this;
    rayIntersects(ray: Ray, raybox: AABBRay, results?: RayBBoxResult): boolean;
}
export { BoundingBox, AABBRay, RayBBoxResult };
