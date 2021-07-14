declare class Hermite {
    static at(a: TVec3, b: TVec3, c: TVec3, d: TVec3, t: number, tension: number, bias: number, out?: TVec3): TVec3;
    static dxdy(a: TVec3, b: TVec3, c: TVec3, d: TVec3, t: number, tension: number, bias: number, out?: TVec3): TVec3;
}
export default Hermite;
