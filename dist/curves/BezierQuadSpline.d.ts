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
    /** Add Points to the spline */
    add(pos: TVec3): BezierQuadSpline;
    /** Update point position using any array based vector object */
    updatePos(idx: number, pos: TVec3): BezierQuadSpline;
    /** Update point position using a XYZ Struct, make it easier to use THREE.JS */
    updatePosStruct(idx: number, pos: TVec3Struct): BezierQuadSpline;
    /** Get Position and Dertivates of the Spline at T */
    at(t: number, pos?: TVec3, dxdy?: TVec3, dxdy2?: TVec3): TVec3;
    /** Which Points to use based on T of spline that isn't a loop */
    _non_loop_index(t: number): [number, number, number, number];
    /** Position On Curve */
    _at(a: TVec3, b: TVec3, c: TVec3, t: number, out: TVec3): TVec3;
    /** First Derivative On Curve */
    _dxdy(a: TVec3, b: TVec3, c: TVec3, t: number, out: TVec3): TVec3;
    /** Second Derivative On Curve */
    _dxdy2(a: TVec3, b: TVec3, c: TVec3, t: number, out: TVec3): TVec3;
}
export default BezierQuadSpline;
