declare class Util {
    /** Generate Indices of both a Looped or Unlooped Grid, Backslash Pattern */
    static gridIndices(out: Array<number>, row_size: number, row_cnt: number, start_idx?: number, do_loop?: boolean, rev_quad?: boolean): void;
    /** Alternating Triangle Pattern, Front/Back Slash */
    static gridAltIndices(out: Array<number>, row_size: number, row_cnt: number, start_idx?: number, rev_quad?: boolean): void;
    static arcVertices(out: Array<number>, angle_a: number, angle_b: number, div: number, radius?: number, offset?: number[]): void;
    static gridVertices(out: Array<number>, width?: number, height?: number, xCells?: number, yCells?: number, useCenter?: boolean): void;
    static circleVertices(out: Array<number>, pntCnt?: number, radius?: number): void;
    static gridTexcoord(out: Array<number>, xLen: number, yLen: number): void;
    /** Create a new TGeo Type Struct */
    static newGeo(): TGeo;
    /** Duplicate a set of vertices while rotating them around an axis */
    static lathe(base: Array<number>, out: Array<number>, steps?: number, repeatStart?: boolean, angleRng?: number, rotAxis?: string): void;
    /** SubDivide the 3 points of a triangle and save the results in a TGeo */
    static subDivideTriangle(out: TGeo, a: TVec3, b: TVec3, c: TVec3, div: number): void;
    /** Compute normals for all the vertices in a TGeo */
    static appendTriangleNormals(geo: TGeo): void;
    /** Flip the winding of the triangles inside of an indices array */
    static reverseWinding(iAry: Array<number>): void;
    static normalizeScaleVertices(geo: TGeo, scl?: number, updateNormals?: boolean): void;
}
export default Util;
