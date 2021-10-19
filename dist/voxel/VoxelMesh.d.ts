import type VoxelChunk from "./VoxelChunk";
declare class VoxelMesh {
    static XP: number;
    static XN: number;
    static YP: number;
    static YN: number;
    static ZP: number;
    static ZN: number;
    static UV: number[];
    static INDEX: number[];
    static FACES: {
        n: number[];
        nOffset: boolean;
        v: number[][];
    }[];
    static fromChunk(chunk: VoxelChunk, geo: TGeo): void;
    static appendFace(fIdx: number, scl: number, origin: TVec3, geo: TGeo): void;
}
export default VoxelMesh;
