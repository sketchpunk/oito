import Vec3 from "../Vec3.js";
/* TODO - Add Loop Mode */
class Point {
    constructor(pos) {
        this.pos = new Vec3();
        this.pos.copy(pos);
    }
}
class BezierCubicSpline {
    constructor() {
        this.points = []; // All the Points that defines all the curves of the Spline
        this._curveCnt = 0; // How many curves make up the spline
        this._pointCnt = 0; // Total points in spline
        //#endregion ////////////////////////////////////////////////////////
    }
    //constructor(){}
    //#region GETTERS / SETTERS
    get curveCnt() { return this._curveCnt; }
    get pointCnt() { return this._pointCnt; }
    //#endregion ////////////////////////////////////////////////////////
    //#region MANAGE POINTS
    /** Add Points to the spline */
    add(pos) {
        this.points.push(new Point(pos));
        this._pointCnt = this.points.length;
        this._curveCnt = Math.max(0, Math.floor((this._pointCnt - 1) / 3));
        return this;
    }
    /** Update point position using any array based vector object */
    updatePos(idx, pos) {
        this.points[idx].pos.copy(pos);
        return this;
    }
    /** Update point position using a XYZ Struct, make it easier to use THREE.JS */
    updatePosStruct(idx, pos) {
        this.points[idx].pos.fromStruct(pos);
        return this;
    }
    //#endregion ////////////////////////////////////////////////////////
    //#region SPLINE
    /** Get Position and Dertivates of the Spline at T */
    at(t, pos, dxdy, dxdy2) {
        if (t > 1)
            t = 1;
        else if (t < 0)
            t = 0;
        const i = this._nonLoopIndex(t);
        const a = this.points[i[0]].pos;
        const b = this.points[i[1]].pos;
        const c = this.points[i[2]].pos;
        const d = this.points[i[3]].pos;
        t = i[4];
        if (pos)
            this._at(a, b, c, d, t, pos);
        if (dxdy)
            this._dxdy(a, b, c, d, t, dxdy);
        if (dxdy2)
            this._dxdy2(a, b, c, d, t, dxdy2);
        return pos || dxdy || dxdy2;
    }
    //#endregion ////////////////////////////////////////////////////////
    //#region COMPUTE
    /** Which Points to use based on T of spline that isn't a loop */
    _nonLoopIndex(t) {
        let i, tt;
        if (t != 1) {
            tt = t * this._curveCnt; // Using Curve count as a way to get the Index and the remainder is the T of the curve
            i = tt | 0; // BitwiseOR 0 same op as Floor, use to FRACT the T of the curve
            tt -= i; // Strip out the whole number to get the decimal norm to be used for the curve ( FRACT )
            i *= 3; // Every 3 points Plus one back counts as 1 bezier cubic curve
        }
        else {
            i = this._pointCnt - 4; // The last 4 points make up the final curve in the spline
            tt = 1; // The end of the final curve.
        }
        return [i, i + 1, i + 2, i + 3, tt];
    }
    /** Position On Curve */
    _at(a, b, c, d, t, out) {
        const i = 1 - t, ii = i * i, iii = ii * i, tt = t * t, ttt = tt * t, iit3 = 3 * ii * t, itt3 = 3 * i * tt;
        out[0] = iii * a[0] + iit3 * b[0] + itt3 * c[0] + ttt * d[0];
        out[1] = iii * a[1] + iit3 * b[1] + itt3 * c[1] + ttt * d[1];
        out[2] = iii * a[2] + iit3 * b[2] + itt3 * c[2] + ttt * d[2];
        return out;
    }
    /** First Derivative On Curve */
    _dxdy(a, b, c, d, t, out) {
        const i = 1 - t, ii3 = 3 * i * i, it6 = 6 * i * t, tt3 = 3 * t * t;
        out[0] = ii3 * (b[0] - a[0]) + it6 * (c[0] - b[0]) + tt3 * (d[0] - c[0]);
        out[1] = ii3 * (b[1] - a[1]) + it6 * (c[1] - b[1]) + tt3 * (d[1] - c[1]);
        out[2] = ii3 * (b[2] - a[2]) + it6 * (c[2] - b[2]) + tt3 * (d[2] - c[2]);
        return out;
    }
    /** Second Derivative On Curve */
    _dxdy2(a, b, c, d, t, out) {
        // https://stackoverflow.com/questions/35901079/calculating-the-inflection-point-of-a-cubic-bezier-curve
        const t6 = 6 * t;
        out[0] = t6 * (d[0] + 3 * (b[0] - c[0]) - a[0]) + 6 * (a[0] - 2 * b[0] + c[0]);
        out[1] = t6 * (d[1] + 3 * (b[1] - c[1]) - a[1]) + 6 * (a[1] - 2 * b[1] + c[1]);
        out[2] = t6 * (d[2] + 3 * (b[2] - c[2]) - a[2]) + 6 * (a[2] - 2 * b[2] + c[2]);
        return out;
    }
}
export default BezierCubicSpline;
