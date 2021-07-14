class Vec4 extends Float32Array {
    //#region CONSTRUCTORS
    constructor(v) {
        super(4);
        if (v instanceof Vec4 || v instanceof Float32Array || (v instanceof Array && v.length == 4)) {
            this[0] = v[0];
            this[1] = v[1];
            this[2] = v[2];
            this[3] = v[3];
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
        this[3] = 1;
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
}
export default Vec4;
