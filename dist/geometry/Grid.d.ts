declare class Grid {
    static get(width?: number, height?: number, xCells?: number, yCells?: number, fromCenter?: boolean): TGeo;
    static getAlt(width?: number, height?: number, xCells?: number, yCells?: number, fromCenter?: boolean): TGeo;
}
export default Grid;
