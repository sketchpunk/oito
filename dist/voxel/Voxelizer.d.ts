import Vec3 from "../Vec3.js";
import VoxelChunk from "./VoxelChunk.js";
declare type TVertices = Array<number> | Float32Array;
declare type TIndices = Array<number> | Uint16Array | Uint32Array;
declare class Voxelizer {
    a: Vec3;
    b: Vec3;
    c: Vec3;
    vmin: Vec3;
    vmax: Vec3;
    minCoord: Vec3;
    maxCoord: Vec3;
    minCell: Vec3;
    maxCell: Vec3;
    fromGeometry(chunk: VoxelChunk, vertices: TVertices, indices: TIndices): void;
    setTriVoxIntersect(ia: number, ib: number, ic: number, vertices: TVertices, chunk: VoxelChunk): void;
}
export default Voxelizer;
