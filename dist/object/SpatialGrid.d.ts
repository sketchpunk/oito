declare class SpatialCell {
    items: Array<SpatialItem>;
    push(itm: SpatialItem): void;
    clear(): void;
}
declare class SpatialItem {
    pos: Array<number>;
    userData: any;
    queryId: number;
    constructor(x: number, y: number, data?: any);
    setData(d: any): this;
    setPos(x: number, y: number): this;
}
declare class SpatialGrid {
    cells: Array<SpatialCell | null>;
    width: number;
    height: number;
    cellSize: number;
    cellXLen: number;
    cellYLen: number;
    queryId: number;
    /** Resize Cell buffer while computing the Cell X Y Count */
    _computeCellCount(): void;
    /** Convert Grid Coordinates to Cell Index */
    _gridIdx(x: number, y: number): number;
    /** Convert Screen Coordinates to Cell Index */
    _coordIdx(x: number, y: number): number;
    /** Convert Screen Coordinates to Grid Coordinates */
    _coordGrid(x: number, y: number): Array<number>;
    _cellMidPoint(x: number, y: number): Array<number>;
    setAreaSize(w: number, h: number): this;
    setCellSize(v: number): this;
    _addToCell(gx: number, gy: number, sItem: SpatialItem): void;
    getCell(gx: number, gy: number): SpatialCell | null;
    clear(): this;
    addCircle(x: number, y: number, radius: number, data?: any): void;
    getNear(x: number, y: number, xRange?: number, yRange?: number): Array<SpatialItem>;
}
export default SpatialGrid;
