declare class OctaSphere {
    static get(subDiv?: number, radius?: number): TGeoIVN;
    static genVerts(subdiv: number, radius: number, vrows: Array<number>, verts: Array<number>, norm: Array<number>): void;
    static repeatPoints(buf: Array<number>, offset: number, cnt: number, scl: TVec3, verts: Array<number>, norm: Array<number>): void;
    static genNormals(verts: Array<number>, out: Array<number>): void;
    static genIndices(subdiv: number, vrows: Array<number>, out: Array<number>): void;
    static genCorner(subdiv: number, irow: Array<number>): Array<number>;
    static arcLerp(a: TVec3, b: TVec3, seg_num: number, ary: Array<number>): void;
}
export default OctaSphere;
