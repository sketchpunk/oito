import Vec3 from "../Vec3.js";
declare class SpatialCell {
    items: Array<SpatialItem>;
    push(itm: SpatialItem): void;
    clear(): void;
}
declare class SpatialItem {
    pos: Array<number>;
    userData: any;
    queryId: number;
    constructor(x: number, y: number, z: number, data?: any);
    setData(d: any): this;
    setPos(x: number, y: number, z: number): this;
}
declare class Spatial3DGrid {
    cells: Array<SpatialCell | null>;
    minBound: Vec3;
    maxBound: Vec3;
    cellSize: number;
    dimension: Vec3;
    maxCoord: Vec3;
    xzCount: number;
    queryId: number;
    /** Resize Cell buffer */
    _computeCells(): void;
    /** Convert Grid Coordinates to Cell Index */
    _gridIdx(coord: TVec3): number;
    /** Convert WorldSpace Position to Cell Index */
    _coordIdx(pos: TVec3): number;
    /** Convert WorldSpace Position to Grid Coordinates */
    _coordGrid(pos: TVec3): Array<number>;
    /** Get Midpoint of a cell from Grid Coordinates */
    _cellMidPoint(coord: TVec3): Array<number>;
    _posInGrid(pos: TVec3): boolean;
    setCellSize(v: number): this;
    /** Compute a Min/Max Chunk Boundary that fits over another bounds by using cell size */
    fitBound(bMin: TVec3, bMax: TVec3): this;
    _addToCell(coord: TVec3, sItem: SpatialItem): void;
    getCell(coord: TVec3): SpatialCell | null;
    clear(): this;
    /** Add a Sphere to the Spacing Grid */
    addSphere(pos: TVec3, radius: number, data?: any): void;
    /** Find all the cells near a World Space position */
    getNear(pos: TVec3, xRange?: number, yRange?: number, zRange?: number): Array<SpatialItem> | null;
}
export default Spatial3DGrid;
