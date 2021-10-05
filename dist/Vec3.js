class Vec3 extends Float32Array {
    constructor(v, y, z) {
        super(3);
        if (v instanceof Vec3 || v instanceof Float32Array || (v instanceof Array && v.length == 3)) {
            this[0] = v[0];
            this[1] = v[1];
            this[2] = v[2];
        }
        else if (typeof v === "number" && typeof y === "number" && typeof z === "number") {
            this[0] = v;
            this[1] = y;
            this[2] = z;
        }
        else if (typeof v === "number") {
            this[0] = v;
            this[1] = v;
            this[2] = v;
        }
    }
    xyz(x, y, z) {
        if (y != undefined && z != undefined) {
            this[0] = x;
            this[1] = y;
            this[2] = z;
        }
        else
            this[0] = this[1] = this[2] = x;
        return this;
    }
    get x() { return this[0]; }
    set x(v) { this[0] = v; }
    get y() { return this[1]; }
    set y(v) { this[1] = v; }
    get z() { return this[2]; }
    set z(v) { this[2] = v; }
    /** Create a new vec3 object with a copy of this vector's data */
    clone() { return new Vec3(this); }
    /** Reset all components to zero */
    reset() {
        this[0] = 0;
        this[1] = 0;
        this[2] = 0;
        return this;
    }
    /** Convert value to a string value */
    toString(rnd = 0) {
        if (rnd == 0)
            return "[" + this.join(",") + "]";
        else {
            let s = "[";
            for (let i = 0; i < 3; i++) {
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
    /** Test if all components equal zero */
    isZero() { return (this[0] == 0 && this[1] == 0 && this[2] == 0); }
    /** Generate a random vector. Can choose per axis range */
    rnd(x0 = 0, x1 = 1, y0 = 0, y1 = 1, z0 = 0, z1 = 1) {
        let t;
        t = Math.random();
        this[0] = x0 * (1 - t) + x1 * t;
        t = Math.random();
        this[1] = y0 * (1 - t) + y1 * t;
        t = Math.random();
        this[2] = z0 * (1 - t) + z1 * t;
        return this;
    }
    /** Return the Index of which axis has the smallest number */
    minAxis() {
        if (this[0] < this[1] && this[0] < this[2])
            return 0;
        if (this[1] < this[2])
            return 1;
        return 2;
    }
    //++++++++++++++++++++++++++++++++++
    fromPolar(lon, lat) {
        const phi = (90 - lat) * 0.01745329251, //deg 2 rad
        theta = lon * 0.01745329251, //( lon + 180 ) * 0.01745329251,
        sp = Math.sin(phi);
        this[0] = -sp * Math.sin(theta);
        this[1] = Math.cos(phi);
        this[2] = sp * Math.cos(theta);
        return this;
    }
    //TODO : toPolar() : [ number, number ];
    // theta   = Math.atan2( Math.sqrt( v[0]**2 + v[1]**2 ), v.z ) + Math.PI / 2;
    // phi     = Math.atan2( v[1], v[0] );
    // Angle around the Y axis, counter-clockwise when looking from above.
    // azimuth : Math.atan2( vector.z, - vector.x );
    // Angle above the XZ plane.
    //inclination Math.atan2( - vector.y, Math.sqrt( ( vector.x * vector.x ) + ( vector.z * vector.z ) ) );
    //++++++++++++++++++++++++++++++++++
    /** Length / Magnitude squared of the vector. Good for quick simple testing */
    lenSqr() { return this[0] ** 2 + this[1] ** 2 + this[2] ** 2; }
    len(v) {
        if (typeof v == "number") {
            //this.norm().scale( v );
            return this;
        }
        return Math.sqrt(this[0] ** 2 + this[1] ** 2 + this[2] ** 2);
    }
    //++++++++++++++++++++++++++++++++++
    /** Copy data from a struct vector type. ThreeJS compatilbility */
    fromStruct(v) {
        this[0] = v.x;
        this[1] = v.y;
        this[2] = v.z;
        return this;
    }
    /** Copy data to a struct vector type. ThreeJS compatilbility */
    toStruct(v) {
        v.x = this[0];
        v.y = this[1];
        v.z = this[2];
        return this;
    }
    /** Copy in vector data */
    copy(v) {
        this[0] = v[0];
        this[1] = v[1];
        this[2] = v[2];
        return this;
    }
    /** Copy data to another vector. Good in chaining operations when upi want a copy of a vec before continuing operations
     * @example
     * let backup = new Vec3()
     * let vec    = new Vec3();
     * vec.add( [1,1,1] ).copyTo( backup ).scale( 5 ); // vec continues operations after saving a copy of itself.
     */
    copyTo(v) {
        v[0] = this[0];
        v[1] = this[1];
        v[2] = this[2];
        return this;
    }
    fromVec2(v, useZ = false) {
        this[0] = v[0];
        if (useZ) {
            this[1] = 0;
            this[2] = v[1];
        }
        else {
            this[1] = v[1];
            this[2] = 0;
        }
        return this;
    }
    //++++++++++++++++++++++++++++++++++
    // FLAT BUFFERS
    /** Used to get data from a flat buffer of vectors, useful when building geometery */
    fromBuf(ary, idx) {
        this[0] = ary[idx];
        this[1] = ary[idx + 1];
        this[2] = ary[idx + 2];
        return this;
    }
    /** Put data into a flat buffer of vectors, useful when building geometery */
    toBuf(ary, idx) {
        ary[idx] = this[0];
        ary[idx + 1] = this[1];
        ary[idx + 2] = this[2];
        return this;
    }
    /** Pust vector components onto an array, useful when building geometery */
    pushTo(ary) {
        ary.push(this[0], this[1], this[2]);
        return this;
    }
    //++++++++++++++++++++++++++++++++++
    // INTERPOLATION SETTERS
    fromLerp(a, b, t) {
        const ti = 1 - t; // Linear Interpolation : (1 - t) * v0 + t * v1;
        this[0] = a[0] * ti + b[0] * t;
        this[1] = a[1] * ti + b[1] * t;
        this[2] = a[2] * ti + b[2] * t;
        return this;
    }
    fromNLerp(a, b, t) {
        const ti = 1 - t; // Linear Interpolation : (1 - t) * v0 + t * v1;
        this[0] = a[0] * ti + b[0] * t;
        this[1] = a[1] * ti + b[1] * t;
        this[2] = a[2] * ti + b[2] * t;
        this.norm();
        return this;
    }
    fromSlerp(a, b, t) {
        const angle = Math.acos(Math.min(Math.max(Vec3.dot(a, b), -1), 1));
        const sin = Math.sin(angle);
        const ta = Math.sin((1 - t) * angle) / sin;
        const tb = Math.sin(t * angle) / sin;
        this[0] = ta * a[0] + tb * b[0];
        this[1] = ta * a[1] + tb * b[1];
        this[2] = ta * a[2] + tb * b[2];
        return this;
    }
    fromHermite(a, b, c, d, t) {
        const tt = t * t;
        const f1 = tt * (2 * t - 3) + 1;
        const f2 = tt * (t - 2) + t;
        const f3 = tt * (t - 1);
        const f4 = tt * (3 - 2 * t);
        this[0] = a[0] * f1 + b[0] * f2 + c[0] * f3 + d[0] * f4;
        this[1] = a[1] * f1 + b[1] * f2 + c[1] * f3 + d[1] * f4;
        this[2] = a[2] * f1 + b[2] * f2 + c[2] * f3 + d[2] * f4;
        return this;
    }
    fromBezier(a, b, c, d, t) {
        const it = 1 - t;
        const it2 = it * it;
        const tt = t * t;
        const f1 = it2 * it;
        const f2 = 3 * t * it2;
        const f3 = 3 * tt * it;
        const f4 = tt * t;
        this[0] = a[0] * f1 + b[0] * f2 + c[0] * f3 + d[0] * f4;
        this[1] = a[1] * f1 + b[1] * f2 + c[1] * f3 + d[1] * f4;
        this[2] = a[2] * f1 + b[2] * f2 + c[2] * f3 + d[2] * f4;
        return this;
    }
    fromCubic(a, b, c, d, t) {
        const t2 = t * t, t3 = t * t2, a0 = d[0] - c[0] - a[0] + b[0], a1 = d[1] - c[1] - a[1] + b[1], a2 = d[2] - c[2] - a[2] + b[2];
        this[0] = a0 * t3 + (a[0] - b[0] - a0) * t2 + (c[0] - a[0]) * t + b[0];
        this[1] = a1 * t3 + (a[1] - b[1] - a1) * t2 + (c[1] - a[1]) * t + b[1];
        this[2] = a2 * t3 + (a[2] - b[2] - a2) * t2 + (c[2] - a[2]) * t + b[2];
        return this;
    }
    //#endregion ////////////////////////////////////////////////////////
    //#region FROM OPERATORS
    /** Add two vectors together */
    fromAdd(a, b) {
        this[0] = a[0] + b[0];
        this[1] = a[1] + b[1];
        this[2] = a[2] + b[2];
        return this;
    }
    /** Subtract two vectors together */
    fromSub(a, b) {
        this[0] = a[0] - b[0];
        this[1] = a[1] - b[1];
        this[2] = a[2] - b[2];
        return this;
    }
    /** Multiply two vectors together */
    fromMul(a, b) {
        this[0] = a[0] * b[0];
        this[1] = a[1] * b[1];
        this[2] = a[2] * b[2];
        return this;
    }
    /** Divide two vectors together */
    fromDiv(a, b) {
        this[0] = (b[0] != 0) ? a[0] / b[0] : 0;
        this[1] = (b[1] != 0) ? a[1] / b[1] : 0;
        this[2] = (b[2] != 0) ? a[2] / b[2] : 0;
        return this;
    }
    /** Scale a vector */
    fromScale(a, s) {
        this[0] = a[0] * s;
        this[1] = a[1] * s;
        this[2] = a[2] * s;
        return this;
    }
    /** Divide vector by a scalar value */
    fromDivScale(a, s) {
        if (s != 0) {
            this[0] = a[0] / s;
            this[1] = a[1] / s;
            this[2] = a[2] / s;
        }
        return this;
    }
    //++++++++++++++++++++++++++++++++++
    // Complex Operators
    fromNorm(v) {
        let mag = Math.sqrt(v[0] ** 2 + v[1] ** 2 + v[2] ** 2);
        if (mag == 0)
            return this;
        mag = 1 / mag;
        this[0] = v[0] * mag;
        this[1] = v[1] * mag;
        this[2] = v[2] * mag;
        return this;
    }
    fromNegate(a) {
        this[0] = -a[0];
        this[1] = -a[1];
        this[2] = -a[2];
        return this;
    }
    fromInvert(a) {
        this[0] = (a[0] != 0) ? 1 / a[0] : 0;
        this[1] = (a[1] != 0) ? 1 / a[1] : 0;
        this[2] = (a[2] != 0) ? 1 / a[2] : 0;
        return this;
    }
    fromCross(a, b) {
        const ax = a[0], ay = a[1], az = a[2], bx = b[0], by = b[1], bz = b[2];
        this[0] = ay * bz - az * by;
        this[1] = az * bx - ax * bz;
        this[2] = ax * by - ay * bx;
        return this;
    }
    fromQuat(q, v) {
        const qx = q[0], qy = q[1], qz = q[2], qw = q[3], vx = v[0], vy = v[1], vz = v[2], x1 = qy * vz - qz * vy, y1 = qz * vx - qx * vz, z1 = qx * vy - qy * vx, x2 = qw * x1 + qy * z1 - qz * y1, y2 = qw * y1 + qz * x1 - qx * z1, z2 = qw * z1 + qx * y1 - qy * x1;
        this[0] = vx + 2 * x2;
        this[1] = vy + 2 * y2;
        this[2] = vz + 2 * z2;
        return this;
    }
    /** Axis Rotation of a Vector */
    fromAxisAngle(axis, rad, v = Vec3.FORWARD) {
        // Rodrigues Rotation formula:
        // v_rot = v * cos(theta) + cross( axis, v ) * sin(theta) + axis * dot( axis, v) * (1-cos(theta))
        const cp = Vec3.cross(axis, v), dot = Vec3.dot(axis, v), s = Math.sin(rad), c = Math.cos(rad), ci = 1 - c;
        this[0] = v[0] * c + cp[0] * s + axis[0] * dot * ci;
        this[1] = v[1] * c + cp[1] * s + axis[1] * dot * ci;
        this[2] = v[2] * c + cp[2] * s + axis[2] * dot * ci;
        return this;
    }
    /*
    OrthogonalBasis( v )
    a = Orthogonal( v );
    b = Cross( a, v );
    */
    fromOrthogonal(v) {
        if (v[0] >= 0.57735026919) {
            this[0] = v[1];
            this[1] = -v[0];
            this[2] = 0;
        }
        else {
            this[0] = 0;
            this[1] = v[2];
            this[2] = -v[1];
        }
        return this;
    }
    // https://github.com/Unity-Technologies/UnityCsReference/blob/master/Runtime/Export/Math/Vector3.cs
    fromReflect(dir, norm) {
        const factor = -2 * Vec3.dot(norm, dir);
        this[0] = factor * norm[0] + dir[0];
        this[1] = factor * norm[1] + dir[1];
        this[2] = factor * norm[2] + dir[2];
        return this;
    }
    //#endregion ////////////////////////////////////////////////////////
    //#region OPERATORS
    /** Add vector to current vector */
    add(a) {
        this[0] += a[0];
        this[1] += a[1];
        this[2] += a[2];
        return this;
    }
    sub(v) {
        this[0] -= v[0];
        this[1] -= v[1];
        this[2] -= v[2];
        return this;
    }
    mul(v) {
        this[0] *= v[0];
        this[1] *= v[1];
        this[2] *= v[2];
        return this;
    }
    div(v) {
        this[0] = (v[0] != 0) ? this[0] / v[0] : 0;
        this[1] = (v[1] != 0) ? this[1] / v[1] : 0;
        this[2] = (v[2] != 0) ? this[2] / v[2] : 0;
        return this;
    }
    divScale(v) {
        if (v != 0) {
            this[0] /= v;
            this[1] /= v;
            this[2] /= v;
        }
        else {
            this[0] = 0;
            this[1] = 0;
            this[2] = 0;
        }
        return this;
    }
    preDivScale(v) {
        this[0] = (this[0] != 0) ? v / this[0] : 0;
        this[1] = (this[1] != 0) ? v / this[1] : 0;
        this[2] = (this[2] != 0) ? v / this[2] : 0;
        return this;
    }
    scale(v) {
        this[0] *= v;
        this[1] *= v;
        this[2] *= v;
        return this;
    }
    invert() {
        this[0] = (this[0] != 0) ? 1 / this[0] : 0;
        this[1] = (this[1] != 0) ? 1 / this[1] : 0;
        this[2] = (this[2] != 0) ? 1 / this[2] : 0;
        return this;
    }
    //++++++++++++++++++++++++++++++++++
    abs() {
        this[0] = Math.abs(this[0]);
        this[1] = Math.abs(this[1]);
        this[2] = Math.abs(this[2]);
        return this;
    }
    floor() {
        this[0] = Math.floor(this[0]);
        this[1] = Math.floor(this[1]);
        this[2] = Math.floor(this[2]);
        return this;
    }
    ceil() {
        this[0] = Math.ceil(this[0]);
        this[1] = Math.ceil(this[1]);
        this[2] = Math.ceil(this[2]);
        return this;
    }
    min(a) {
        this[0] = Math.min(this[0], a[0]);
        this[1] = Math.min(this[1], a[1]);
        this[2] = Math.min(this[2], a[2]);
        return this;
    }
    max(a) {
        this[0] = Math.max(this[0], a[0]);
        this[1] = Math.max(this[1], a[1]);
        this[2] = Math.max(this[2], a[2]);
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
        return this;
    }
    negate() {
        this[0] = -this[0];
        this[1] = -this[1];
        this[2] = -this[2];
        return this;
    }
    norm() {
        let mag = Math.sqrt(this[0] ** 2 + this[1] ** 2 + this[2] ** 2);
        if (mag != 0) {
            mag = 1 / mag;
            this[0] *= mag;
            this[1] *= mag;
            this[2] *= mag;
        }
        return this;
    }
    clamp(min, max) {
        this[0] = Math.min(Math.max(this[0], min[0]), max[0]);
        this[1] = Math.min(Math.max(this[1], min[1]), max[1]);
        this[2] = Math.min(Math.max(this[2], min[2]), max[2]);
        return this;
    }
    snap(v) {
        this[0] = (v[0] != 0) ? Math.floor(this[0] / v[0]) * v[0] : 0;
        this[1] = (v[1] != 0) ? Math.floor(this[1] / v[1]) * v[1] : 0;
        this[2] = (v[2] != 0) ? Math.floor(this[2] / v[2]) * v[2] : 0;
        return this;
    }
    dot(b) { return this[0] * b[0] + this[1] * b[1] + this[2] * b[2]; }
    //#endregion ////////////////////////////////////////////////////////
    //#region TRANSFORM
    axisAngle(axis, rad) {
        // Rodrigues Rotation formula:
        // v_rot = v * cos(theta) + cross( axis, v ) * sin(theta) + axis * dot( axis, v) * (1-cos(theta))
        const cp = Vec3.cross(axis, this), dot = Vec3.dot(axis, this), s = Math.sin(rad), c = Math.cos(rad), ci = 1 - c;
        this[0] = this[0] * c + cp[0] * s + axis[0] * dot * ci;
        this[1] = this[1] * c + cp[1] * s + axis[1] * dot * ci;
        this[2] = this[2] * c + cp[2] * s + axis[2] * dot * ci;
        return this;
    }
    rotate(rad, axis = "x") {
        //https://www.siggraph.org/education/materials/HyperGraph/modeling/mod_tran/3drota.htm
        const sin = Math.sin(rad), cos = Math.cos(rad), x = this[0], y = this[1], z = this[2];
        switch (axis) {
            case "y": //..........................
                this[0] = z * sin + x * cos; //x
                this[2] = z * cos - x * sin; //z
                break;
            case "x": //..........................
                this[1] = y * cos - z * sin; //y
                this[2] = y * sin + z * cos; //z
                break;
            case "z": //..........................
                this[0] = x * cos - y * sin; //x
                this[1] = x * sin + y * cos; //y
                break;
        }
        return this;
    }
    transformMat3(m) {
        const x = this[0], y = this[1], z = this[2];
        this[0] = x * m[0] + y * m[3] + z * m[6];
        this[1] = x * m[1] + y * m[4] + z * m[7];
        this[2] = x * m[2] + y * m[5] + z * m[8];
        return this;
    }
    transformMat4(m) {
        const x = this[0], y = this[1], z = this[2], w = (m[3] * x + m[7] * y + m[11] * z + m[15]) || 1.0;
        this[0] = (m[0] * x + m[4] * y + m[8] * z + m[12]) / w;
        this[1] = (m[1] * x + m[5] * y + m[9] * z + m[13]) / w;
        this[2] = (m[2] * x + m[6] * y + m[10] * z + m[14]) / w;
        return this;
    }
    transformQuat(q) {
        const qx = q[0], qy = q[1], qz = q[2], qw = q[3], vx = this[0], vy = this[1], vz = this[2], x1 = qy * vz - qz * vy, y1 = qz * vx - qx * vz, z1 = qx * vy - qy * vx, x2 = qw * x1 + qy * z1 - qz * y1, y2 = qw * y1 + qz * x1 - qx * z1, z2 = qw * z1 + qx * y1 - qy * x1;
        this[0] = vx + 2 * x2;
        this[1] = vy + 2 * y2;
        this[2] = vz + 2 * z2;
        return this;
    }
    //#endregion ////////////////////////////////////////////////////////
    //#region STATIC METHODS
    static add(a, b) { return new Vec3().fromAdd(a, b); }
    static sub(a, b) { return new Vec3().fromSub(a, b); }
    static mul(a, b) { return new Vec3().fromMul(a, b); }
    static divScale(a, s) { return new Vec3().fromDivScale(a, s); }
    static scale(a, s) { return new Vec3().fromScale(a, s); }
    static equal(a, b) { return (a[0] == b[0] && a[1] == b[1] && a[2] == b[2]); }
    static cross(a, b) { return new Vec3().fromCross(a, b); }
    static lenSqr(a, b) { return (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2; }
    static len(a, b) {
        if (b === undefined)
            return Math.sqrt(a[0] ** 2 + a[1] ** 2 + a[2] ** 2);
        return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2);
    }
    static norm(x, y, z) {
        const rtn = new Vec3();
        if (x instanceof Vec3 || x instanceof Float32Array || (x instanceof Array && x.length == 3)) {
            rtn.copy(x);
        }
        else if (typeof x === "number" && typeof y === "number" && typeof z === "number") {
            rtn.xyz(x, y, z);
        }
        return rtn.norm();
    }
    //++++++++++++++++++++++++++++++++++
    static dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
    static angle(a, b) {
        //acos(dot(a,b)/(len(a)*len(b))) 
        //let theta = this.dot( a, b ) / ( Math.sqrt( a.lenSqr * b.lenSqr ) );
        //return Math.acos( Math.max( -1, Math.min( 1, theta ) ) ); // clamp ( t, -1, 1 )
        // atan2(len(cross(a,b)),dot(a,b))  
        const d = this.dot(a, b), c = this.cross(a, b);
        return Math.atan2(c.len(), d);
        //let cosine = this.dot( a, b );
        //if(cosine > 1.0) return 0;
        //else if(cosine < -1.0) return Math.PI;
        //else return Math.acos( cosine / ( Math.sqrt( a.lenSqr * b.lenSqr() ) ) );
    }
    static project(from, to, out) {
        // Modified from https://github.com/Unity-Technologies/UnityCsReference/blob/master/Runtime/Export/Math/Vector3.cs#L265
        // dot( a, b ) / dot( b, b ) * b
        if (out == undefined)
            out = new Vec3();
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        const denom = Vec3.dot(to, to);
        if (denom < 0.000001) {
            out[0] = 0;
            out[1] = 0;
            out[2] = 0;
            return out;
        }
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        const scl = Vec3.dot(from, to) / denom;
        out[0] = to[0] * scl;
        out[1] = to[1] * scl;
        out[2] = to[2] * scl;
        return out;
    }
    static lerp(a, b, t) { return new Vec3().fromLerp(a, b, t); }
    static fromStruct(v) { return new Vec3().fromStruct(v); }
    static fromQuat(q, v) { return new Vec3(v).transformQuat(q); }
    //++++++++++++++++++++++++++++++++++
    /** Create an array filled with Vec3 Objects */
    static createAarray(len) {
        const ary = new Array(len);
        for (let i = 0; i < len; i++)
            ary[i] = new Vec3();
        return ary;
    }
    /** Create an Iterator Object that allows an easy way to loop a Float32Buffer
     * @example
     * let buf = new Float32Array( 3 * 10 );
     * for( let v of Vec3.bufIter( buf ) ) console.log( v );
    */
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    static bufIter(buf) {
        let i = 0;
        const result = { value: new Vec3(), done: false }, len = buf.length, next = () => {
            if (i >= len)
                result.done = true;
            else {
                result.value.fromBuf(buf, i);
                i += 3;
            }
            return result;
        };
        return { [Symbol.iterator]() { return { next }; } };
    }
    /** Loop through a buffer array and use a function to update each vector
     * @example
     * let verts = [ 0,0,0, 0,0,0 ];
     * let dir   = [ 0,1,0 ];
     * Vec3.bufMap( vertices, (v,i)=>v.add( dir ) ); */
    static bufMap(buf, fn, startIdx = 0, endIdx = 0) {
        const end = (endIdx == 0) ? buf.length : endIdx;
        const v = new Vec3();
        let i = startIdx;
        for (i; i < end; i += 3) {
            // Fill Data
            v[0] = buf[i];
            v[1] = buf[i + 1];
            v[2] = buf[i + 2];
            // Transform Data
            fn(v, i);
            // Save Data Back
            buf[i] = v[0];
            buf[i + 1] = v[1];
            buf[i + 2] = v[2];
        }
    }
}
//#region STATIC VALUES
Vec3.BYTESIZE = 3 * Float32Array.BYTES_PER_ELEMENT;
Vec3.UP = [0, 1, 0];
Vec3.DOWN = [0, -1, 0];
Vec3.LEFT = [-1, 0, 0];
Vec3.RIGHT = [1, 0, 0];
Vec3.FORWARD = [0, 0, 1];
Vec3.BACK = [0, 0, -1];
Vec3.ZERO = [0, 0, 0];
export default Vec3;
