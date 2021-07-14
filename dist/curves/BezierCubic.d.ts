declare class BezierCubic {
    static at(a: TVec3, b: TVec3, c: TVec3, d: TVec3, t: number, out?: TVec3): TVec3;
    static dxdy(a: TVec3, b: TVec3, c: TVec3, d: TVec3, t: number, out?: TVec3): TVec3;
    static dxdy2(a: TVec3, b: TVec3, c: TVec3, d: TVec3, t: number, out?: TVec3): TVec3;
}
export default BezierCubic;
