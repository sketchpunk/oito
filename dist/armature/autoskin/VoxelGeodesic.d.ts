import type VoxelChunk from "../../voxel/VoxelChunk.js";
declare class VoxelGeodesic {
    cells: Map<string, GeodesicCell>;
    smooth: number;
    minDistance: number;
    maxDistance: number;
    addCell(coord: TVec3, midPoint: TVec3): this;
    getCell(coord: TVec3): GeodesicCell | undefined;
    setDistanceIfLower(coord: TVec3, bIdx: number, dist: number): boolean;
    getDistance(coord: TVec3, bIdx: number): number;
    getCellMidPoint(coord: TVec3): TVec3;
    /** Get the Vertex's Bone Weight & Indices */
    getVertexWeight(coord: TVec3, vert: TVec3, outWeights: TVec4, outIndices: TVec4): boolean;
    /** Create GeoDesic Cell data for each active voxel cell  */
    fromChunk(chunk: VoxelChunk): void;
}
declare class GeodesicCell {
    items: Map<number, GeodesicItem>;
    midPoint: number[];
    constructor(mid: TVec3);
    add(idx: number): GeodesicItem;
    getDistance(bIdx: number): number;
}
declare class GeodesicItem {
    distance: number;
    boneIdx: number;
    constructor(idx: number);
}
export default VoxelGeodesic;
