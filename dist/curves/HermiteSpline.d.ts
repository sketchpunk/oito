import Vec3 from "../Vec3.js";
declare class Point {
    pos: Vec3;
    tension: number;
    bias: number;
    constructor(pos: TVec3, tension?: number, bias?: number);
}
declare class HermiteSpline {
    points: Array<Point>;
    _curve_cnt: number;
    _point_cnt: number;
    _is_loop: boolean;
    time: number;
    tension: number;
    bias: number;
    ten_bias_p: number;
    ten_bias_n: number;
    constructor(isLoop?: boolean);
    get curveCount(): number;
    get pointCount(): number;
    add(pos: TVec3, tension?: number, bias?: number): HermiteSpline;
    updatePos(idx: number, pos: TVec3): HermiteSpline;
    /** Update point position using a XYZ Struct, make it easier to use THREE.JS */
    updatePosStruct(idx: number, pos: TVec3Struct): HermiteSpline;
    /** Get position / first derivative of the curve */
    at(t: number, pos?: TVec3, dxdy?: TVec3): TVec3;
    /** Get position / first derivative of specific curve on the spline  */
    atCurve(idx: number, t: number, pos?: TVec3, dxdy?: TVec3): TVec3;
    /** Compute the indexes of the curve if the spline isn't a closed loop */
    _nonLoopIndex(t: number): [number, number, number, number];
    /** Compute the indexes of the curve if the spline is a closed loop */
    _loopIndex(t: number): [number, number, number, number];
    /** Precompute and cache values for every at call, for optimization */
    _precalcParams(t: number, bi: number, ci: number): void;
    _at(a: TVec3, b: TVec3, c: TVec3, d: TVec3, t: number, out: TVec3): TVec3;
    _dxdy(a: TVec3, b: TVec3, c: TVec3, d: TVec3, t: number, out: TVec3): TVec3;
}
export default HermiteSpline;
