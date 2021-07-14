import Vec3 from "../Vec3.js";
class Point {
    constructor(pos) {
        this.pos = new Vec3();
        this.pos.copy(pos);
    }
}
class BezierQuadSpline {
    constructor() {
        this.points = []; // All the Points that defines all the curves of the Spline
        this._curve_cnt = 0; // How many curves make up the spline
        this._point_cnt = 0; // Total points in spline
        //#endregion ////////////////////////////////////////////////////////
        //#region MISC
        /*
        debug( draw, steps=10, inc_dxdy=false, inc_dxdy2=false ){
            let prev = new Vec3();
            let pos  = new Vec3();
            let dev  = new Vec3();
            let t;
    
            // Draw First Point
            this.at( 0, prev );
            draw.pnt( prev, "yellow", 0.05, 1 );
    
            for( let i=1; i <= steps; i++ ){
                t = i / steps;
    
                //------------------------------------
                // Draw Step
                this.at( t, pos );
                draw
                    .ln( prev, pos, "yellow" )
                    .pnt( pos, "yellow", 0.05, 1 );
    
                //------------------------------------
                // Draw Forward Direction
                if( inc_dxdy ){
                    this.at( t, null, dev );
                    draw.ln( pos, dev.norm().scale( 0.4 ).add( pos ), "white" );
                }
    
                //------------------------------------
                // Draw Forward Direction
                if( inc_dxdy2 ){
                    this.at( t, null, null, dev );
                    draw.ln( pos, dev.norm().scale( 0.4 ).add( pos ), "cyan" );
                }
    
                //------------------------------------
                prev.copy( pos );
            }
        }
        */
        //#endregion ////////////////////////////////////////////////////////
    }
    //constructor(){}
    //#region GETTERS / SETTERS
    get curve_cnt() { return this._curve_cnt; }
    get point_cnt() { return this._point_cnt; }
    //#endregion ////////////////////////////////////////////////////////
    //#region MANAGE POINTS
    add(pos) {
        this.points.push(new Point(pos));
        this._point_cnt = this.points.length;
        this._curve_cnt = Math.max(0, Math.floor((this.point_cnt - 1) / 2));
        return this;
    }
    updatePos(idx, pos) {
        this.points[idx].pos.copy(pos);
        return this;
    }
    //#endregion ////////////////////////////////////////////////////////
    //#region SPLINE
    at(t, pos, dxdy, dxdy2) {
        if (t > 1)
            t = 1;
        else if (t < 0)
            t = 0;
        const i = this._non_loop_index(t);
        const a = this.points[i[0]].pos;
        const b = this.points[i[1]].pos;
        const c = this.points[i[2]].pos;
        t = i[3];
        if (pos)
            this._at(a, b, c, t, pos);
        if (dxdy)
            this._dxdy(a, b, c, t, dxdy);
        if (dxdy2)
            this._dxdy2(a, b, c, t, dxdy2);
        return pos || dxdy || dxdy2;
    }
    //#endregion ////////////////////////////////////////////////////////
    //#region COMPUTE
    _non_loop_index(t) {
        let i, tt;
        if (t != 1) {
            tt = t * this._curve_cnt; // Using Curve count as a way to get the Index and the remainder is the T of the curve
            i = tt | 0; // BitwiseOR 0 same op as Floor, use to FRACT the T of the curve
            tt -= i; // Strip out the whole number to get the decimal norm to be used for the curve ( FRACT )
            i *= 2; // Every 3 points Plus one back counts as 1 bezier cubic curve
        }
        else {
            i = this._point_cnt - 3; // The last 4 points make up the final curve in the spline
            tt = 1; // The end of the final curve.
        }
        return [i, i + 1, i + 2, tt];
    }
    _at(a, b, c, t, out) {
        // https://en.wikipedia.org/wiki/B%C3%A9zier_curve
        // (1-t) * ((1-t) * a + t * b) + t((1-t) * b + t * c)
        const s = 1 - t;
        out[0] = s * (s * a[0] + t * b[0]) + t * (s * b[0] + t * c[0]);
        out[1] = s * (s * a[1] + t * b[1]) + t * (s * b[1] + t * c[1]);
        out[2] = s * (s * a[2] + t * b[2]) + t * (s * b[2] + t * c[2]);
        return out;
    }
    _dxdy(a, b, c, t, out) {
        // 2 * (1-t) * (b-a) + 2 * t * ( c - b );
        const s2 = 2 * (1 - t);
        const t2 = 2 * t;
        out[0] = s2 * (b[0] - a[0]) + t2 * (c[0] - b[0]);
        out[1] = s2 * (b[1] - a[1]) + t2 * (c[1] - b[1]);
        out[2] = s2 * (b[2] - a[2]) + t2 * (c[2] - b[2]);
        return out;
    }
    _dxdy2(a, b, c, t, out) {
        // 2 * ( c - 2 * b + a )
        // -4b + 2a + 2c [ Simplifed Version ]
        out[0] = -4 * b[0] + 2 * a[0] + 2 * c[0];
        out[1] = -4 * b[1] + 2 * a[1] + 2 * c[1];
        out[2] = -4 * b[2] + 2 * a[2] + 2 * c[2];
        return out;
    }
}
export default BezierQuadSpline;
