import Vec3 from '../Vec3.js';
interface IterCellAllInfo {
    min: Vec3;
    max: Vec3;
    coord: Vec3;
    isOn: boolean;
}
interface IterCellInfo {
    min: Vec3;
    max: Vec3;
    coord: Vec3;
}
declare class VoxelChunk {
    _cellState: Uint8Array;
    _cellData: Array<any> | null;
    cellSize: number;
    xzCount: number;
    dimension: Vec3;
    maxCoord: Vec3;
    minBound: Vec3;
    maxBound: Vec3;
    constructor(cellSize?: number);
    setCellSize(n: number): this;
    /** Compute a Min/Max Chunk Boundary that fits over another bounds by using cell size */
    fitBound(bMin: TVec3, bMax: TVec3): this;
    /** Create a Chunk Boundary based on how many cells are needed and its size, plus the origin point optional */
    asAxisBlock(cellSize: number, xCnt: number, yCnt: number, zCnt: number, origin?: TVec3): this;
    _buildStateArray(): void;
    get cellCount(): number;
    getStateArrayRef(): Uint8Array | null;
    setState(coord: TVec3, isOn: boolean): this;
    getState(coord: TVec3): boolean;
    resetState(): this;
    getNeighbors(coord: TVec3): Array<TVec3>;
    getActiveNeighbors(coord: TVec3): Array<TVec3>;
    /** Using Voxel Coordinates, Gets the Cell Array Index */
    coordIdx(coord: TVec3): number;
    /** Using Cell Array Index, Compute Voxel Coordinate */
    idxCoord(i: number, out?: TVec3): TVec3;
    /** Convert Worldspace Position to Voxel Coordinates */
    posCoord(pos: TVec3, out?: Vec3): Vec3;
    /** Get the cell min/max boundary from voxel coordinates */
    coordBound(coord: TVec3, minOut: Vec3, maxOut: Vec3): void;
    /** Get the cell min boundary from voxel coordinates */
    coordMinBound(coord: TVec3, minOut: Vec3): void;
    /** Get the center point of a cell */
    coordMidPoint(coord: TVec3, out: Vec3): void;
    isCoord(coord: TVec3): boolean;
    /** Loop over all the cells */
    iterAllCells(): Iterable<IterCellAllInfo>;
    /** Loop over only cells that are active */
    iterActiveCells(): Iterable<IterCellInfo>;
}
export default VoxelChunk;
