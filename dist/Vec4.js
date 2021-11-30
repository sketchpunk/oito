class Vec4 extends Float32Array {
    //#region STATIC VALUES
    static BYTESIZE = 4 * Float32Array.BYTES_PER_ELEMENT;
    constructor(v, y, z, w) {
        super(4);
        if (v instanceof Vec4 || v instanceof Float32Array || (v instanceof Array && v.length == 4)) {
            this[0] = v[0];
            this[1] = v[1];
            this[2] = v[2];
            this[3] = v[3];
        }
        else if (typeof v === "number" && typeof y === "number" && typeof z === "number" && typeof w === "number") {
            this[0] = v;
            this[1] = y;
            this[2] = z;
            this[3] = w;
        }
        else if (typeof v === "number") {
            this[0] = v;
            this[1] = v;
            this[2] = v;
            this[3] = v;
        }
    }
    //#endregion ////////////////////////////////////////////////////////
    //#region SETTERS / GETTERS
    xyzw(x, y, z, w) {
        this[0] = x;
        this[1] = y;
        this[2] = z;
        this[3] = w;
        return this;
    }
    get x() { return this[0]; }
    set x(v) { this[0] = v; }
    get y() { return this[1]; }
    set y(v) { this[1] = v; }
    get z() { return this[2]; }
    set z(v) { this[2] = v; }
    get w() { return this[3]; }
    set w(v) { this[3] = v; }
    clone() { return new Vec4(this); }
    /** Reset all components to zero */
    reset() {
        this[0] = 0;
        this[1] = 0;
        this[2] = 0;
        this[3] = 0;
        return this;
    }
    /** Convert value to a string value */
    toString(rnd = 0) {
        if (rnd == 0)
            return "[" + this.join(",") + "]";
        else {
            let s = "[";
            for (let i = 0; i < 4; i++) {
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
    //++++++++++++++++++++++++++++++++++
    /** Length / Magnitude squared of the vector. Good for quick simple testing */
    get lenSqr() { return this[0] ** 2 + this[1] ** 2 + this[2] ** 2 + this[3] ** 2; }
    len(v) {
        if (typeof v == "number") {
            //this.norm().scale( v );
            return this;
        }
        return Math.sqrt(this[0] ** 2 + this[1] ** 2 + this[2] ** 2 + this[3] ** 2);
    }
    //++++++++++++++++++++++++++++++++++
    /** Copy data from a struct vector type. ThreeJS compatilbility */
    fromStruct(v) {
        this[0] = v.x;
        this[1] = v.y;
        this[2] = v.z;
        this[3] = v.w;
        return this;
    }
    /** Copy data to a struct vector type. ThreeJS compatilbility */
    toStruct(v) {
        v.x = this[0];
        v.y = this[1];
        v.z = this[2];
        v.w = this[3];
        return this;
    }
    /** Copy in quaternion data */
    copy(v) {
        this[0] = v[0];
        this[1] = v[1];
        this[2] = v[2];
        this[3] = v[3];
        return this;
    }
    /** Copy data to another quaternion. Good in chaining operations when you want a copy of a quaternion before continuing operations */
    copyTo(v) {
        v[0] = this[0];
        v[1] = this[1];
        v[2] = this[2];
        v[3] = this[3];
        return this;
    }
    //++++++++++++++++++++++++++++++++++
    // FLAT BUFFERS
    /** Used to get data from a flat buffer of vectors */
    fromBuf(ary, idx) {
        this[0] = ary[idx];
        this[1] = ary[idx + 1];
        this[2] = ary[idx + 2];
        this[3] = ary[idx + 3];
        return this;
    }
    /** Put data into a flat buffer of vectors */
    toBuf(ary, idx) {
        ary[idx] = this[0];
        ary[idx + 1] = this[1];
        ary[idx + 2] = this[2];
        ary[idx + 3] = this[3];
        return this;
    }
    /** Push quaternion components onto an array */
    pushTo(ary) {
        ary.push(this[0], this[1], this[2], this[3]);
        return this;
    }
    //#endregion ////////////////////////////////////////////////////////
    //#region FROM OPERATORS
    /** Add two vectors together */
    fromAdd(a, b) {
        this[0] = a[0] + b[0];
        this[1] = a[1] + b[1];
        this[2] = a[2] + b[2];
        this[3] = a[3] + b[3];
        return this;
    }
    /** Subtract two vectors together */
    fromSub(a, b) {
        this[0] = a[0] - b[0];
        this[1] = a[1] - b[1];
        this[2] = a[2] - b[2];
        this[3] = a[3] - b[3];
        return this;
    }
    /** Multiply two vectors together */
    fromMul(a, b) {
        this[0] = a[0] * b[0];
        this[1] = a[1] * b[1];
        this[2] = a[2] * b[2];
        this[3] = a[3] * b[3];
        return this;
    }
    /** Divide two vectors together */
    fromDiv(a, b) {
        this[0] = (b[0] != 0) ? a[0] / b[0] : 0;
        this[1] = (b[1] != 0) ? a[1] / b[1] : 0;
        this[2] = (b[2] != 0) ? a[2] / b[2] : 0;
        this[3] = (b[3] != 0) ? a[3] / b[3] : 0;
        return this;
    }
    /** Scale a vector */
    fromScale(a, s) {
        this[0] = a[0] * s;
        this[1] = a[1] * s;
        this[2] = a[2] * s;
        this[3] = a[3] * s;
        return this;
    }
    /** Divide vector by a scalar value */
    fromDivScale(a, s) {
        if (s != 0) {
            this[0] = a[0] / s;
            this[1] = a[1] / s;
            this[2] = a[2] / s;
            this[3] = a[3] / s;
        }
        return this;
    }
    //++++++++++++++++++++++++++++++++++
    // Complex Operators
    fromNorm(v) {
        let mag = Math.sqrt(v[0] ** 2 + v[1] ** 2 + v[2] ** 2 + v[3] ** 2);
        if (mag == 0)
            return this;
        mag = 1 / mag;
        this[0] = v[0] * mag;
        this[1] = v[1] * mag;
        this[2] = v[2] * mag;
        this[3] = v[3] * mag;
        return this;
    }
    fromNegate(a) {
        this[0] = -a[0];
        this[1] = -a[1];
        this[2] = -a[2];
        this[3] = -a[3];
        return this;
    }
    //#endregion ////////////////////////////////////////////////////////
    //#region OPERATORS
    /** Add vector to current vector */
    add(a) {
        this[0] += a[0];
        this[1] += a[1];
        this[2] += a[2];
        this[3] += a[3];
        return this;
    }
    sub(v) {
        this[0] -= v[0];
        this[1] -= v[1];
        this[2] -= v[2];
        this[3] -= v[3];
        return this;
    }
    mul(v) {
        this[0] *= v[0];
        this[1] *= v[1];
        this[2] *= v[2];
        this[3] *= v[3];
        return this;
    }
    div(v) {
        this[0] = (v[0] != 0) ? this[0] / v[0] : 0;
        this[1] = (v[1] != 0) ? this[1] / v[1] : 0;
        this[2] = (v[2] != 0) ? this[2] / v[2] : 0;
        this[3] = (v[3] != 0) ? this[3] / v[3] : 0;
        return this;
    }
    divScale(v) {
        if (v != 0) {
            this[0] /= v;
            this[1] /= v;
            this[2] /= v;
            this[3] /= v;
        }
        else {
            this[0] = 0;
            this[1] = 0;
            this[2] = 0;
            this[3] = 0;
        }
        return this;
    }
    preDivScale(v) {
        this[0] = (this[0] != 0) ? v / this[0] : 0;
        this[1] = (this[1] != 0) ? v / this[1] : 0;
        this[2] = (this[2] != 0) ? v / this[2] : 0;
        this[3] = (this[3] != 0) ? v / this[3] : 0;
        return this;
    }
    scale(v) {
        this[0] *= v;
        this[1] *= v;
        this[2] *= v;
        this[3] *= v;
        return this;
    }
    //++++++++++++++++++++++++++++++++++
    abs() {
        this[0] = Math.abs(this[0]);
        this[1] = Math.abs(this[1]);
        this[2] = Math.abs(this[2]);
        this[3] = Math.abs(this[3]);
        return this;
    }
    floor() {
        this[0] = Math.floor(this[0]);
        this[1] = Math.floor(this[1]);
        this[2] = Math.floor(this[2]);
        this[3] = Math.floor(this[3]);
        return this;
    }
    ceil() {
        this[0] = Math.ceil(this[0]);
        this[1] = Math.ceil(this[1]);
        this[2] = Math.ceil(this[2]);
        this[3] = Math.ceil(this[3]);
        return this;
    }
    /** When values are very small, like less then 0.000001, just make it zero */
    nearZero() {
        if (Math.abs(this[0]) <= 1e-6)
            this[0] = 0;
        if (Math.abs(this[1]) <= 1e-6)
            this[1] = 0;
        if (Math.abs(this[2]) <= 1e-6)
            this[2] = 0;
        if (Math.abs(this[3]) <= 1e-6)
            this[3] = 0;
        return this;
    }
    negate() {
        this[0] = -this[0];
        this[1] = -this[1];
        this[2] = -this[2];
        this[3] = -this[3];
        return this;
    }
    norm() {
        let mag = Math.sqrt(this[0] ** 2 + this[1] ** 2 + this[2] ** 2 + this[3] ** 2);
        if (mag != 0) {
            mag = 1 / mag;
            this[0] *= mag;
            this[1] *= mag;
            this[2] *= mag;
            this[3] *= mag;
        }
        return this;
    }
    clamp(min, max) {
        this[0] = Math.min(Math.max(this[0], min[0]), max[0]);
        this[1] = Math.min(Math.max(this[1], min[1]), max[1]);
        this[2] = Math.min(Math.max(this[2], min[2]), max[2]);
        this[3] = Math.min(Math.max(this[3], min[3]), max[3]);
        return this;
    }
    snap(v) {
        this[0] = (v[0] != 0) ? Math.floor(this[0] / v[0]) * v[0] : 0;
        this[1] = (v[1] != 0) ? Math.floor(this[1] / v[1]) * v[1] : 0;
        this[2] = (v[2] != 0) ? Math.floor(this[2] / v[2]) * v[2] : 0;
        this[3] = (v[3] != 0) ? Math.floor(this[3] / v[3]) * v[3] : 0;
        return this;
    }
}
export default Vec4;
