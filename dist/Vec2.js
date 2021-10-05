class Vec2 extends Float32Array {
    constructor(v, y) {
        super(2);
        if (v instanceof Vec2 || v instanceof Float32Array || (v instanceof Array && v.length == 2)) {
            this[0] = v[0];
            this[1] = v[1];
        }
        else if (typeof v === "number" && typeof y === "number") {
            this[0] = v;
            this[1] = y;
        }
        else if (typeof v === "number") {
            this[0] = v;
            this[1] = v;
        }
    }
    xy(x, y) {
        if (y != undefined) {
            this[0] = x;
            this[1] = y;
        }
        else
            this[0] = this[1] = x;
        return this;
    }
    get x() { return this[0]; }
    set x(v) { this[0] = v; }
    get y() { return this[1]; }
    set y(v) { this[1] = v; }
    /** Create a new vec3 object with a copy of this vector's data */
    clone() { return new Vec2(this); }
    copy(v) { this[0] = v[0]; this[1] = v[1]; return this; }
    /** Reset all components to zero */
    reset() {
        this[0] = 0;
        this[1] = 0;
        return this;
    }
    /** Convert value to a string value */
    toString(rnd = 0) {
        if (rnd == 0)
            return "[" + this.join(",") + "]";
        else {
            let s = "[";
            for (let i = 0; i < 2; i++) {
                switch (this[i]) {
                    case 0:
                        s += "0,";
                        break;
                    case 1:
                        s += "1,";
                        break;
                    default:
                        s += this[i].toFixed(rnd) + ",";
                        break;
                }
            }
            return s.slice(0, -1) + "]";
        }
    }
    toArray() { return [this[0], this[1]]; }
    /** Test if all components equal zero */
    isZero() { return (this[0] == 0 && this[1] == 0); }
    /** When values are very small, like less then 0.000001, just make it zero.*/
    nearZero(x = 1e-6, y = 1e-6) {
        if (Math.abs(this[0]) <= x)
            this[0] = 0;
        if (Math.abs(this[1]) <= y)
            this[1] = 0;
        return this;
    }
    /** Generate a random vector. Can choose per axis range */
    rnd(x0 = 0, x1 = 1, y0 = 0, y1 = 1) {
        let t;
        t = Math.random();
        this[0] = x0 * (1 - t) + x1 * t;
        t = Math.random();
        this[1] = y0 * (1 - t) + y1 * t;
        return this;
    }
    angle(v) {
        if (v) {
            return Math.acos(Vec2.dot(this, v) / (this.len() * v.len()));
            //var x = v[0] - this[0],
            //	y = v[1] - this[1];
            //return Math.atan2(y, x);
        }
        return Math.atan2(this[1], this[0]);
    }
    setLen(len) { return this.norm().scale(len); }
    len() { return Math.sqrt(this[0] * this[0] + this[1] * this[1]); }
    lenSqr() { return this[0] * this[0] + this[1] * this[1]; }
    //#endregion ////////////////////////////////////////////////////////
    // #region FROM SETTERS / OPERATORS
    fromAngleLen(ang, len) {
        this[0] = len * Math.cos(ang);
        this[1] = len * Math.sin(ang);
        return this;
    }
    fromAdd(a, b) { this[0] = a[0] + b[0]; this[1] = a[1] + b[1]; return this; }
    fromSub(a, b) { this[0] = a[0] - b[0]; this[1] = a[1] - b[1]; return this; }
    fromScale(a, s) { this[0] = a[0] * s; this[1] = a[1] * s; return this; }
    fromLerp(a, b, t) {
        const tt = 1 - t;
        this[0] = a[0] * tt + b[0] * t;
        this[1] = a[1] * tt + b[1] * t;
        return this;
    }
    fromVec3(v, z_plane = true) {
        this[0] = v[0];
        this[1] = (z_plane) ? v[2] : v[1];
        return this;
    }
    fromMax(a, b) {
        this[0] = Math.max(a[0], b[0]);
        this[1] = Math.max(a[1], b[1]);
        return this;
    }
    fromMin(a, b) {
        this[0] = Math.min(a[0], b[0]);
        this[1] = Math.min(a[1], b[1]);
        return this;
    }
    fromFloor(v) {
        this[0] = Math.floor(v[0]);
        this[1] = Math.floor(v[1]);
        return this;
    }
    fromFract(v) {
        this[0] = v[0] - Math.floor(v[0]);
        this[1] = v[1] - Math.floor(v[1]);
        return this;
    }
    //++++++++++++++++++++++++++++++++++
    // FLAT BUFFERS
    /** Used to get data from a flat buffer of vectors, useful when building geometery */
    fromBuf(ary, idx) {
        this[0] = ary[idx];
        this[1] = ary[idx + 1];
        return this;
    }
    /** Put data into a flat buffer of vectors, useful when building geometery */
    toBuf(ary, idx) {
        ary[idx] = this[0];
        ary[idx + 1] = this[1];
        return this;
    }
    /** Pust vector components onto an array, useful when building geometery */
    pushTo(ary) {
        ary.push(this[0], this[1]);
        return this;
    }
    //#endregion ////////////////////////////////////////////////////////
    // #region MATH OPERATIONS
    add(v) { this[0] += v[0]; this[1] += v[1]; return this; }
    addRaw(x, y) { this[0] += x; this[1] += y; return this; }
    sub(v) { this[0] -= v[0]; this[1] -= v[1]; return this; }
    subRaw(x, y) { this[0] -= x; this[1] -= y; return this; }
    mul(v) { this[0] *= v[0]; this[1] *= v[1]; return this; }
    div(v) {
        this[0] = (v[0] != 0) ? this[0] / v[0] : 0;
        this[1] = (v[1] != 0) ? this[1] / v[1] : 0;
        return this;
    }
    scale(v) { this[0] *= v; this[1] *= v; return this; }
    divScale(v) { this[0] /= v; this[1] /= v; return this; }
    divInvScale(v, out) {
        out = out || this;
        out[0] = (this[0] != 0) ? v / this[0] : 0;
        out[1] = (this[1] != 0) ? v / this[1] : 0;
        return out;
    }
    floor(out) {
        out = out || this;
        out[0] = Math.floor(this[0]);
        out[1] = Math.floor(this[1]);
        return out;
    }
    min(a) {
        this[0] = Math.min(this[0], a[0]);
        this[1] = Math.min(this[1], a[1]);
        return this;
    }
    max(a) {
        this[0] = Math.max(this[0], a[0]);
        this[1] = Math.max(this[1], a[1]);
        return this;
    }
    norm(out) {
        const mag = Math.sqrt(this[0] * this[0] + this[1] * this[1]);
        if (mag == 0)
            return this;
        out = out || this;
        out[0] = this[0] / mag;
        out[1] = this[1] / mag;
        return out;
    }
    lerp(v, t, out) {
        out = out || this;
        const ti = 1 - t;
        //Linear Interpolation : (1 - t) * v0 + t * v1;
        out[0] = this[0] * ti + v[0] * t;
        out[1] = this[1] * ti + v[1] * t;
        return out;
    }
    rotate(rad, out) {
        out = out || this;
        const cos = Math.cos(rad), sin = Math.sin(rad), x = this[0], y = this[1];
        out[0] = x * cos - y * sin;
        out[1] = x * sin + y * cos;
        return out;
    }
    rotateDeg(deg, out) {
        out = out || this;
        const rad = deg * Math.PI / 180, cos = Math.cos(rad), sin = Math.sin(rad), x = this[0], y = this[1];
        out[0] = x * cos - y * sin;
        out[1] = x * sin + y * cos;
        return out;
    }
    invert(out) {
        out = out || this;
        out[0] = -this[0];
        out[1] = -this[1];
        return out;
    }
    perpCW() {
        const x = this[0];
        this[0] = this[1];
        this[1] = -x;
        return this;
    }
    perpCCW() {
        const x = this[0];
        this[0] = -this[1];
        this[1] = x;
        return this;
    }
    // #endregion ///////////////////////////////////////////////////////////////////////
    // #region STATIC OPERATIONS
    static add(a, b) { return new Vec2().fromAdd(a, b); }
    static sub(a, b) { return new Vec2().fromSub(a, b); }
    static scale(v, s) { return new Vec2().fromScale(v, s); }
    static floor(v) { return new Vec2().fromFloor(v); }
    static fract(v) { return new Vec2().fromFract(v); }
    static lerp(v0, v1, t) { return new Vec2().fromLerp(v0, v1, t); }
    static len(v0, v1) { return Math.sqrt((v0[0] - v1[0]) ** 2 + (v0[1] - v1[1]) ** 2); }
    static lenSqr(v0, v1) { return (v0[0] - v1[0]) ** 2 + (v0[1] - v1[1]) ** 2; }
    static dot(a, b) { return a[0] * b[0] + a[1] * b[1]; }
    static det(a, b) { return a[0] * b[1] - a[1] * b[0]; } // "cross product" / determinant also = len(a)*len(b) * sin( angle );
    static project(from, to) {
        // Modified from https://github.com/Unity-Technologies/UnityCsReference/blob/master/Runtime/Export/Math/Vector3.cs#L265
        // dot( a, b ) / dot( b, b ) * b
        const out = new Vec2();
        const denom = Vec2.dot(to, to);
        if (denom < 0.000001)
            return out;
        const scl = Vec2.dot(from, to) / denom;
        return out.fromScale(to, scl); //xy( to[0] * scl, to[1] * scl );
    }
    // From FROM and TO should have the same Origin.
    // FROM is a straight line from origin to plane. May need to do some extra projection to get this value.
    // To is treated like a Ray from the origin.
    static projectPlane(from, to, planeNorm) {
        const out = new Vec2();
        const denom = Vec2.dot(to, planeNorm);
        if (denom < 0.000001 && denom > -0.000001)
            return out;
        const t = Vec2.dot(from, planeNorm) / denom;
        return out.fromScale(to, t);
    }
    static rotateDeg(v, deg) {
        const out = new Vec2();
        const rad = deg * Math.PI / 180, cos = Math.cos(rad), sin = Math.sin(rad), x = v[0], y = v[1];
        out[0] = x * cos - y * sin;
        out[1] = x * sin + y * cos;
        return out;
    }
    static perpCW(v) {
        const out = new Vec2();
        out[0] = v[1];
        out[1] = -v[0];
        return out;
    }
    static perpCCW(v) {
        const out = new Vec2();
        out[0] = -v[1];
        out[1] = v[0];
        return out;
    }
    /** Create an Iterator Object that allows an easy way to loop a Float32Buffer
     * @example
     * let buf = new Float32Array( 2 * 10 );
     * for( let v of Vec3.bufIter( buf ) ) console.log( v );
    */
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    static bufIter(buf) {
        let i = 0;
        const result = { value: new Vec2(), done: false }, len = buf.length, next = () => {
            if (i >= len)
                result.done = true;
            else {
                result.value.fromBuf(buf, i);
                i += 2;
            }
            return result;
        };
        return { [Symbol.iterator]() { return { next }; } };
    }
}
//#region STATIC VALUES
Vec2.BYTESIZE = 2 * Float32Array.BYTES_PER_ELEMENT;
export default Vec2;
