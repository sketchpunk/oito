import type VoxelChunk from './VoxelChunk.js';
import Vec3 from '../Vec3.js';
import { BoundingBox, AABBRay, RayBBoxResult } from '../ray/BoundingBox.js';
import type Ray from '../ray/Ray.js';
declare class VoxelRayHit {
    coord: Array<number>;
    pos: Vec3;
    norm: Vec3;
    t: number;
    constructor(ix: number, iy: number, iz: number, pos: TVec3, norm: TVec3, t: number);
}
declare class VoxelRay {
    tries: number;
    rayBox: AABBRay;
    rayResults: RayBBoxResult;
    inPos: Vec3;
    inPosLoc: Vec3;
    dir: Vec3;
    ix: number;
    iy: number;
    iz: number;
    xOut: number;
    yOut: number;
    zOut: number;
    xBound: number;
    yBound: number;
    zBound: number;
    xt: number;
    yt: number;
    zt: number;
    xDelta: number;
    yDelta: number;
    zDelta: number;
    nAxis: number;
    iAxis: number;
    norm: Vec3;
    boundPos: number;
    ray_t: number;
    _init(ray: Ray, chunk: VoxelChunk, bbox: BoundingBox): boolean;
    _step(): boolean;
    _step_next_hit(ray: Ray, chunk: VoxelChunk): void;
    _new_hit(): VoxelRayHit;
    fullIntersect(ray: Ray, chunk: VoxelChunk, bbox?: BoundingBox): Array<VoxelRayHit> | null;
}
export default VoxelRay;
