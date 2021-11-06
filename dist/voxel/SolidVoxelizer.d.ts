import Vec3 from "../Vec3.js";
import VoxelChunk from "./VoxelChunk.js";
declare type TVertices = Array<number> | Float32Array;
declare type TIndices = Array<number> | Uint16Array | Uint32Array;
declare class CellData {
    norm: Vec3;
    hasBackface: boolean;
    hasFrontface: boolean;
    setNorm(n: TVec3): this;
    static genKey(x: number, y: number, z: number): string;
}
declare class SolidVoxelizer {
    a: Vec3;
    b: Vec3;
    c: Vec3;
    vmin: Vec3;
    vmax: Vec3;
    minCoord: Vec3;
    maxCoord: Vec3;
    minCell: Vec3;
    maxCell: Vec3;
    v0: Vec3;
    v1: Vec3;
    data: Map<string, CellData>;
    fromGeometry(chunk: VoxelChunk, vertices: TVertices, indices: TIndices): void;
    setTriVoxIntersect(ia: number, ib: number, ic: number, vertices: TVertices, chunk: VoxelChunk): void;
    getTriNorm(a: TVec3, b: TVec3, c: TVec3, out: Vec3): void;
    fillVolume(chunk: VoxelChunk): void;
}
export default SolidVoxelizer;
