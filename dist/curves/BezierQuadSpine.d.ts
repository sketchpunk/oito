import Vec3 from "../Vec3.js";
declare class Point {
    pos: Vec3;
    constructor(pos: TVec3);
}
declare class BezierQuadSpline {
    points: Array<Point>;
    _curve_cnt: number;
    _point_cnt: number;
    get curve_cnt(): number;
    get point_cnt(): number;
    add(pos: TVec3): BezierQuadSpline;
    updatePos(idx: number, pos: TVec3): BezierQuadSpline;
    at(t: number, pos?: TVec3, dxdy?: TVec3, dxdy2?: TVec3): TVec3;
    _non_loop_index(t: number): [number, number, number, number];
    _at(a: TVec3, b: TVec3, c: TVec3, t: number, out: TVec3): TVec3;
    _dxdy(a: TVec3, b: TVec3, c: TVec3, t: number, out: TVec3): TVec3;
    _dxdy2(a: TVec3, b: TVec3, c: TVec3, t: number, out: TVec3): TVec3;
}
export default BezierQuadSpline;
