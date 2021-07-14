declare class BezierQuad {
    static at(a: TVec3, b: TVec3, c: TVec3, t: number, out?: TVec3): TVec3;
    static dxdy(a: TVec3, b: TVec3, c: TVec3, t: number, out?: TVec3): TVec3;
    static dxdy2(a: TVec3, b: TVec3, c: TVec3, t: number, out?: TVec3): TVec3;
}
export default BezierQuad;
