import Maths from "./Maths.js";
import Vec3 from "./Vec3.js";
class Quat extends Float32Array {
    //#region STATIC VALUES
    static BYTESIZE = 4 * Float32Array.BYTES_PER_ELEMENT;
    //#endregion ////////////////////////////////////////////////////////
    //#region CONSTRUCTORS
    constructor(v) {
        super(4);
        if (v instanceof Quat || v instanceof Float32Array || (v instanceof Array && v.length == 4)) {
            this[0] = v[0];
            this[1] = v[1];
            this[2] = v[2];
            this[3] = v[3];
        }
        else {
            this[0] = 0;
            this[1] = 0;
            this[2] = 0;
            this[3] = 1;
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
    /** Create a new Quat object with a copy of this vector's data */
    clone() { return new Quat(this); }
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
    isZero() { return (this[0] == 0 && this[1] == 0 && this[2] == 0 && this[3] == 0); }
    //++++++++++++++++++++++++++++++++++
    /** Length / Magnitude squared of the vector. Good for quick simple testing */
    get lenSqr() { return this[0] ** 2 + this[1] ** 2 + this[2] ** 2 + this[3] ** 2; }
    len() { return Math.sqrt(this[0] ** 2 + this[1] ** 2 + this[2] ** 2 + this[3] ** 2); }
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
    /** Put data into a flat buffer of quaternions */
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
    //++++++++++++++++++++++++++++++++++
    getAxisAngle() {
        if (this[3] > 1)
            this.norm(); // TODO Fix it so its not distructive
        const angle = 2 * Math.acos(this[3]), s = Math.sqrt(1 - this[3] * this[3]);
        if (s < 0.001)
            return [1, 0, 0, 0];
        return [this[0] / s, this[1] / s, this[2] / s, angle];
    }
    getAngle() {
        if (this[3] > 1)
            this.norm(); // TODO Fix it so its not distructive
        return 2 * Math.acos(this[3]);
    }
    getAxis(out) {
        if (this[3] > 1)
            this.norm(); // TODO Fix it so its not distructive
        const s = Math.sqrt(1 - this[3] ** 2);
        out = out || [0, 0, 0];
        if (s < 0.001) {
            out[0] = 1;
            out[1] = 0;
            out[2] = 0;
        }
        else {
            out[0] = this[0] / s;
            out[1] = this[1] / s;
            out[2] = this[2] / s;
        }
        return out;
    }
    //++++++++++++++++++++++++++++++++++
    fromPolar(lon, lat, up) {
        lat = Math.max(Math.min(lat, 89.999999), -89.999999); // Clamp lat, going to 90+ makes things spring around.
        const phi = (90 - lat) * 0.01745329251, // PI / 180
        theta = lon * 0.01745329251, phi_s = Math.sin(phi), v = [
            -(phi_s * Math.sin(theta)),
            Math.cos(phi),
            phi_s * Math.cos(theta)
        ];
        this.fromLook(v, up || Vec3.UP);
        return this;
    }
    toPolar() {
        const fwd = Vec3.fromQuat(this, Vec3.FORWARD); // Forward Direction
        const flat = Vec3.norm(fwd.x, 0, fwd.z); // Flatten Direction
        let lon = Vec3.angle(Vec3.FORWARD, flat); // Lon Angle in Rads
        let lat = Vec3.angle(flat, fwd); // Lat Angle in Rads
        const d_side = Vec3.dot(fwd, Vec3.RIGHT); // Right Hemi Test
        const d_up = Vec3.dot(fwd, Vec3.UP); // Top Hemi Test
        // Negitive Check
        if (d_side < 0)
            lon = -lon;
        if (d_up < 0)
            lat = -lat;
        // If Point UP / Down, Can get Lon easily
        // TODO, to fix this issue may need to sample 
        // RIGHT Direction to compute LON.
        if (d_up > 0.999 || d_up <= -0.999)
            lon = 0;
        const to_deg = 180 / Math.PI;
        return [lon * to_deg, lat * to_deg];
    }
    //++++++++++++++++++++++++++++++++++
    // FROM SETTERS
    fromAxis(xAxis, yAxis, zAxis) {
        const m00 = xAxis[0], m01 = xAxis[1], m02 = xAxis[2], m10 = yAxis[0], m11 = yAxis[1], m12 = yAxis[2], m20 = zAxis[0], m21 = zAxis[1], m22 = zAxis[2], t = m00 + m11 + m22;
        let x, y, z, w, s;
        if (t > 0.0) {
            s = Math.sqrt(t + 1.0);
            w = s * 0.5; // |w| >= 0.5
            s = 0.5 / s;
            x = (m12 - m21) * s;
            y = (m20 - m02) * s;
            z = (m01 - m10) * s;
        }
        else if ((m00 >= m11) && (m00 >= m22)) {
            s = Math.sqrt(1.0 + m00 - m11 - m22);
            x = 0.5 * s; // |x| >= 0.5
            s = 0.5 / s;
            y = (m01 + m10) * s;
            z = (m02 + m20) * s;
            w = (m12 - m21) * s;
        }
        else if (m11 > m22) {
            s = Math.sqrt(1.0 + m11 - m00 - m22);
            y = 0.5 * s; // |y| >= 0.5
            s = 0.5 / s;
            x = (m10 + m01) * s;
            z = (m21 + m12) * s;
            w = (m20 - m02) * s;
        }
        else {
            s = Math.sqrt(1.0 + m22 - m00 - m11);
            z = 0.5 * s; // |z| >= 0.5
            s = 0.5 / s;
            x = (m20 + m02) * s;
            y = (m21 + m12) * s;
            w = (m01 - m10) * s;
        }
        this[0] = x;
        this[1] = y;
        this[2] = z;
        this[3] = w;
        return this;
    }
    fromLook(vDir, vUp) {
        // Ported to JS from C# example at https://pastebin.com/ubATCxJY
        // TODO, if Dir and Up are equal, a roll happends. Need to find a way to fix this.
        const up = new Vec3(vUp), zAxis = new Vec3(vDir), // Forward
        xAxis = new Vec3(), // Right
        yAxis = new Vec3(); // Up
        xAxis.fromCross(up, zAxis);
        yAxis.fromCross(zAxis, xAxis); // new up
        xAxis.norm();
        yAxis.norm();
        zAxis.norm();
        //fromAxis - Mat3 to Quat
        const m00 = xAxis.x, m01 = xAxis.y, m02 = xAxis.z, m10 = yAxis.x, m11 = yAxis.y, m12 = yAxis.z, m20 = zAxis.x, m21 = zAxis.y, m22 = zAxis.z, t = m00 + m11 + m22;
        let x, y, z, w, s;
        if (t > 0.0) {
            s = Math.sqrt(t + 1.0);
            w = s * 0.5; // |w| >= 0.5
            s = 0.5 / s;
            x = (m12 - m21) * s;
            y = (m20 - m02) * s;
            z = (m01 - m10) * s;
        }
        else if ((m00 >= m11) && (m00 >= m22)) {
            s = Math.sqrt(1.0 + m00 - m11 - m22);
            x = 0.5 * s; // |x| >= 0.5
            s = 0.5 / s;
            y = (m01 + m10) * s;
            z = (m02 + m20) * s;
            w = (m12 - m21) * s;
        }
        else if (m11 > m22) {
            s = Math.sqrt(1.0 + m11 - m00 - m22);
            y = 0.5 * s; // |y| >= 0.5
            s = 0.5 / s;
            x = (m10 + m01) * s;
            z = (m21 + m12) * s;
            w = (m20 - m02) * s;
        }
        else {
            s = Math.sqrt(1.0 + m22 - m00 - m11);
            z = 0.5 * s; // |z| >= 0.5
            s = 0.5 / s;
            x = (m20 + m02) * s;
            y = (m21 + m12) * s;
            w = (m01 - m10) * s;
        }
        this[0] = x;
        this[1] = y;
        this[2] = z;
        this[3] = w;
        return this;
    }
    fromInvert(q) {
        const a0 = q[0], a1 = q[1], a2 = q[2], a3 = q[3], dot = a0 * a0 + a1 * a1 + a2 * a2 + a3 * a3;
        if (dot == 0) {
            this[0] = this[1] = this[2] = this[3] = 0;
            return this;
        }
        const invDot = 1.0 / dot; // let invDot = dot ? 1.0/dot : 0;
        this[0] = -a0 * invDot;
        this[1] = -a1 * invDot;
        this[2] = -a2 * invDot;
        this[3] = a3 * invDot;
        return this;
    }
    /** Axis must be normlized, Angle is in Rads  */
    fromAxisAngle(axis, angle) {
        const half = angle * .5, s = Math.sin(half);
        this[0] = axis[0] * s;
        this[1] = axis[1] * s;
        this[2] = axis[2] * s;
        this[3] = Math.cos(half);
        return this;
    }
    /** Using unit vectors, Shortest rotation from Direction A to Direction B  */
    fromUnitVecs(a, b) {
        // http://glmatrix.net/docs/quat.js.html#line548
        // http://physicsforgames.blogspot.com/2010/03/Quat-tricks.html
        const dot = Vec3.dot(a, b);
        if (dot < -0.999999) {
            const tmp = Vec3.cross(Vec3.LEFT, a);
            if (tmp.len() < 0.000001)
                tmp.fromCross(Vec3.UP, a);
            this.fromAxisAngle(tmp.norm(), Math.PI);
        }
        else if (dot > 0.999999) {
            this[0] = 0;
            this[1] = 0;
            this[2] = 0;
            this[3] = 1;
        }
        else {
            const v = Vec3.cross(a, b);
            this[0] = v[0];
            this[1] = v[1];
            this[2] = v[2];
            this[3] = 1 + dot;
            this.norm();
        }
        return this;
    }
    //++++++++++++++++++++++++++++++++++
    // FROM TYPES
    fromMat3(m) {
        // https://github.com/toji/gl-matrix/blob/master/src/gl-matrix/quat.js#L305
        // Algorithm in Ken Shoemake's article in 1987 SIGGRAPH course notes
        // article "Quat Calculus and Fast Animation".
        let fRoot;
        const fTrace = m[0] + m[4] + m[8];
        if (fTrace > 0.0) {
            // |w| > 1/2, may as well choose w > 1/2
            fRoot = Math.sqrt(fTrace + 1.0); // 2w
            this[3] = 0.5 * fRoot;
            fRoot = 0.5 / fRoot; // 1/(4w)
            this[0] = (m[5] - m[7]) * fRoot;
            this[1] = (m[6] - m[2]) * fRoot;
            this[2] = (m[1] - m[3]) * fRoot;
        }
        else {
            // |w| <= 1/2
            let i = 0;
            if (m[4] > m[0])
                i = 1;
            if (m[8] > m[i * 3 + i])
                i = 2;
            const j = (i + 1) % 3;
            const k = (i + 2) % 3;
            fRoot = Math.sqrt(m[i * 3 + i] - m[j * 3 + j] - m[k * 3 + k] + 1.0);
            this[i] = 0.5 * fRoot;
            fRoot = 0.5 / fRoot;
            this[3] = (m[j * 3 + k] - m[k * 3 + j]) * fRoot;
            this[j] = (m[j * 3 + i] + m[i * 3 + j]) * fRoot;
            this[k] = (m[k * 3 + i] + m[i * 3 + k]) * fRoot;
        }
        return this;
    }
    fromMat4(mat) {
        // https://github.com/toji/gl-matrix/blob/master/src/mat4.js
        // Algorithm taken from http://www.euclideanspace.com/maths/geometry/rotations/conversions/matrixToQuat/index.htm
        const trace = mat[0] + mat[5] + mat[10];
        let S = 0;
        if (trace > 0) {
            S = Math.sqrt(trace + 1.0) * 2;
            this[3] = 0.25 * S;
            this[0] = (mat[6] - mat[9]) / S;
            this[1] = (mat[8] - mat[2]) / S;
            this[2] = (mat[1] - mat[4]) / S;
        }
        else if ((mat[0] > mat[5]) && (mat[0] > mat[10])) {
            S = Math.sqrt(1.0 + mat[0] - mat[5] - mat[10]) * 2;
            this[3] = (mat[6] - mat[9]) / S;
            this[0] = 0.25 * S;
            this[1] = (mat[1] + mat[4]) / S;
            this[2] = (mat[8] + mat[2]) / S;
        }
        else if (mat[5] > mat[10]) {
            S = Math.sqrt(1.0 + mat[5] - mat[0] - mat[10]) * 2;
            this[3] = (mat[8] - mat[2]) / S;
            this[0] = (mat[1] + mat[4]) / S;
            this[1] = 0.25 * S;
            this[2] = (mat[6] + mat[9]) / S;
        }
        else {
            S = Math.sqrt(1.0 + mat[10] - mat[0] - mat[5]) * 2;
            this[3] = (mat[1] - mat[4]) / S;
            this[0] = (mat[8] + mat[2]) / S;
            this[1] = (mat[6] + mat[9]) / S;
            this[2] = 0.25 * S;
        }
        return this;
    }
    //++++++++++++++++++++++++++++++++++
    // EULER
    getEuler(out, inDeg = false) {
        // http://bediyap.com/programming/convert-Quat-to-euler-rotations/
        // http://schteppe.github.io/cannon.js/docs/files/src_math_Quat.js.html
        let pitch = 0, yaw = 0, roll = 0;
        const x = this[0], y = this[1], z = this[2], w = this[3], test = x * y + z * w;
        //..............................
        // singularity at north pole
        if (test > 0.499) { //console.log("North");
            pitch = 2 * Math.atan2(x, w);
            yaw = Math.PI / 2;
            roll = 0;
        }
        //..............................
        // singularity at south pole
        if (test < -0.499) { //console.log("South");
            pitch = -2 * Math.atan2(x, w);
            yaw = -Math.PI / 2;
            roll = 0;
        }
        //..............................
        if (isNaN(pitch)) { // console.log("isNan");
            const sqz = z * z;
            roll = Math.atan2(2 * x * w - 2 * y * z, 1 - 2 * x * x - 2 * sqz); // bank
            pitch = Math.atan2(2 * y * w - 2 * x * z, 1 - 2 * y * y - 2 * sqz); // Heading
            yaw = Math.asin(2 * test); // attitude
        }
        //..............................
        const deg = (inDeg) ? 180 / Math.PI : 1;
        out = out || [0, 0, 0];
        out[0] = roll * deg;
        out[1] = pitch * deg;
        out[2] = yaw * deg;
        return out;
    }
    fromEuler(x, y, z) {
        let xx = 0, yy = 0, zz = 0;
        if (x instanceof Vec3 || x instanceof Float32Array || (x instanceof Array && x.length == 3)) {
            xx = x[0] * 0.01745329251 * 0.5;
            yy = x[1] * 0.01745329251 * 0.5;
            zz = x[2] * 0.01745329251 * 0.5;
        }
        else if (typeof x === "number" && typeof y === "number" && typeof z === "number") {
            xx = x * 0.01745329251 * 0.5;
            yy = y * 0.01745329251 * 0.5;
            zz = z * 0.01745329251 * 0.5;
        }
        const c1 = Math.cos(xx), c2 = Math.cos(yy), c3 = Math.cos(zz), s1 = Math.sin(xx), s2 = Math.sin(yy), s3 = Math.sin(zz);
        this[0] = s1 * c2 * c3 + c1 * s2 * s3;
        this[1] = c1 * s2 * c3 - s1 * c2 * s3;
        this[2] = c1 * c2 * s3 - s1 * s2 * c3;
        this[3] = c1 * c2 * c3 + s1 * s2 * s3;
        return this.norm();
    }
    /**order="YXZ", Values in Degrees, will be converted to Radians by function */
    fromEulerXY(x, y) {
        const xx = x * 0.01745329251 * 0.5, yy = y * 0.01745329251 * 0.5, c1 = Math.cos(xx), c2 = Math.cos(yy), s1 = Math.sin(xx), s2 = Math.sin(yy);
        this[0] = s1 * c2;
        this[1] = c1 * s2;
        this[2] = -s1 * s2;
        this[3] = c1 * c2;
        return this.norm();
    }
    fromEulerOrder(x, y, z, order = "YXZ") {
        // https://github.com/mrdoob/three.js/blob/dev/src/math/Quat.js
        const c1 = Math.cos(x * 0.5), //Math.cos(x/2)
        c2 = Math.cos(y * 0.5), //Math.cos(y/2),
        c3 = Math.cos(z * 0.5), //Math.cos(z/2),
        s1 = Math.sin(x * 0.5), //Math.sin(x/2),
        s2 = Math.sin(y * 0.5), //Math.sin(y/2)
        s3 = Math.sin(z * 0.5); //Math.sin(z/2)
        switch (order) {
            case 'XYZ':
                this[0] = s1 * c2 * c3 + c1 * s2 * s3;
                this[1] = c1 * s2 * c3 - s1 * c2 * s3;
                this[2] = c1 * c2 * s3 + s1 * s2 * c3;
                this[3] = c1 * c2 * c3 - s1 * s2 * s3;
                break;
            case 'YXZ':
                this[0] = s1 * c2 * c3 + c1 * s2 * s3;
                this[1] = c1 * s2 * c3 - s1 * c2 * s3;
                this[2] = c1 * c2 * s3 - s1 * s2 * c3;
                this[3] = c1 * c2 * c3 + s1 * s2 * s3;
                break;
            case 'ZXY':
                this[0] = s1 * c2 * c3 - c1 * s2 * s3;
                this[1] = c1 * s2 * c3 + s1 * c2 * s3;
                this[2] = c1 * c2 * s3 + s1 * s2 * c3;
                this[3] = c1 * c2 * c3 - s1 * s2 * s3;
                break;
            case 'ZYX':
                this[0] = s1 * c2 * c3 - c1 * s2 * s3;
                this[1] = c1 * s2 * c3 + s1 * c2 * s3;
                this[2] = c1 * c2 * s3 - s1 * s2 * c3;
                this[3] = c1 * c2 * c3 + s1 * s2 * s3;
                break;
            case 'YZX':
                this[0] = s1 * c2 * c3 + c1 * s2 * s3;
                this[1] = c1 * s2 * c3 + s1 * c2 * s3;
                this[2] = c1 * c2 * s3 - s1 * s2 * c3;
                this[3] = c1 * c2 * c3 - s1 * s2 * s3;
                break;
            case 'XZY':
                this[0] = s1 * c2 * c3 - c1 * s2 * s3;
                this[1] = c1 * s2 * c3 - s1 * c2 * s3;
                this[2] = c1 * c2 * s3 + s1 * s2 * c3;
                this[3] = c1 * c2 * c3 + s1 * s2 * s3;
                break;
        }
        return this.norm();
    }
    //++++++++++++++++++++++++++++++++++
    fromAngularVec(v) {
        let len = Vec3.len(v);
        if (len < 0.000001) {
            this.reset();
            return this;
        }
        const h = 0.5 * len;
        const s = Math.sin(h);
        const c = Math.cos(h);
        len = 1 / len;
        this[0] = s * (v[0] * len);
        this[1] = s * (v[1] * len);
        this[2] = s * (v[2] * len);
        this[3] = c;
        return this;
    }
    toAngularVec(out) {
        const v = this.getAxisAngle();
        out = out || new Vec3();
        return out.fromScale(v, v[3]); // axis * angle;
    }
    //#endregion ////////////////////////////////////////////////////////
    //#region FROM OPERATORS
    fromMul(a, b) {
        const ax = a[0], ay = a[1], az = a[2], aw = a[3], bx = b[0], by = b[1], bz = b[2], bw = b[3];
        this[0] = ax * bw + aw * bx + ay * bz - az * by;
        this[1] = ay * bw + aw * by + az * bx - ax * bz;
        this[2] = az * bw + aw * bz + ax * by - ay * bx;
        this[3] = aw * bw - ax * bx - ay * by - az * bz;
        return this;
    }
    //#endregion ////////////////////////////////////////////////////////
    //#region OPERATORS
    norm() {
        let len = this[0] ** 2 + this[1] ** 2 + this[2] ** 2 + this[3] ** 2;
        if (len > 0) {
            len = 1 / Math.sqrt(len);
            this[0] *= len;
            this[1] *= len;
            this[2] *= len;
            this[3] *= len;
        }
        return this;
    }
    invert() {
        const a0 = this[0], a1 = this[1], a2 = this[2], a3 = this[3], dot = a0 * a0 + a1 * a1 + a2 * a2 + a3 * a3;
        if (dot == 0) {
            this[0] = this[1] = this[2] = this[3] = 0;
            return this;
        }
        const invDot = 1.0 / dot; // let invDot = dot ? 1.0/dot : 0;
        this[0] = -a0 * invDot;
        this[1] = -a1 * invDot;
        this[2] = -a2 * invDot;
        this[3] = a3 * invDot;
        return this;
    }
    negate() {
        this[0] = -this[0];
        this[1] = -this[1];
        this[2] = -this[2];
        this[3] = -this[3];
        return this;
    }
    /** Checks if on opposite hemisphere, if so, negate this quat */
    dotNegate(q) {
        if (Quat.dot(this, q) < 0)
            this.negate();
        return this;
    }
    conjugate() {
        this[0] = -this[0];
        this[1] = -this[1];
        this[2] = -this[2];
        return this;
    }
    mirrorX() {
        this[1] = -this[1];
        this[2] = -this[2];
        return this;
    }
    random() {
        // http://planning.cs.uiuc.edu/node198.html  uniform random quaternion
        const u1 = Math.random(), u2 = Math.random(), u3 = Math.random(), r1 = Math.sqrt(1 - u1), r2 = Math.sqrt(u1);
        this[0] = r1 * Math.sin(Maths.PI_2 * u2);
        this[1] = r1 * Math.cos(Maths.PI_2 * u2);
        this[2] = r2 * Math.sin(Maths.PI_2 * u3);
        this[3] = r2 * Math.cos(Maths.PI_2 * u3);
        return this;
    }
    scaleAngle(scl) {
        if (this[3] > 1)
            this.norm();
        const angle = 2 * Math.acos(this[3]), len = 1 / Math.sqrt(this[0] ** 2 + this[1] ** 2 + this[2] ** 2), // Get Length to normalize axis
        half = (angle * scl) * 0.5, // Calc Angle, Scale it then Half it.
        s = Math.sin(half); // Do Normalize and SinHalf at the same time
        this[0] = (this[0] * len) * s;
        this[1] = (this[1] * len) * s;
        this[2] = (this[2] * len) * s;
        this[3] = Math.cos(half);
        return this;
    }
    transformVec3(v) {
        const qx = this[0], qy = this[1], qz = this[2], qw = this[3], vx = v[0], vy = v[1], vz = v[2], x1 = qy * vz - qz * vy, y1 = qz * vx - qx * vz, z1 = qx * vy - qy * vx, x2 = qw * x1 + qy * z1 - qz * y1, y2 = qw * y1 + qz * x1 - qx * z1, z2 = qw * z1 + qx * y1 - qy * x1;
        v[0] = vx + 2 * x2;
        v[1] = vy + 2 * y2;
        v[2] = vz + 2 * z2;
        return this;
    }
    //++++++++++++++++++++++++++++++++++
    rotX(rad) {
        //https://github.com/toji/gl-matrix/blob/master/src/gl-matrix/quat.js
        rad *= 0.5;
        const ax = this[0], ay = this[1], az = this[2], aw = this[3], bx = Math.sin(rad), bw = Math.cos(rad);
        this[0] = ax * bw + aw * bx;
        this[1] = ay * bw + az * bx;
        this[2] = az * bw - ay * bx;
        this[3] = aw * bw - ax * bx;
        return this;
    }
    rotY(rad) {
        rad *= 0.5;
        const ax = this[0], ay = this[1], az = this[2], aw = this[3], by = Math.sin(rad), bw = Math.cos(rad);
        this[0] = ax * bw - az * by;
        this[1] = ay * bw + aw * by;
        this[2] = az * bw + ax * by;
        this[3] = aw * bw - ay * by;
        return this;
    }
    rotZ(rad) {
        rad *= 0.5;
        const ax = this[0], ay = this[1], az = this[2], aw = this[3], bz = Math.sin(rad), bw = Math.cos(rad);
        this[0] = ax * bw + ay * bz;
        this[1] = ay * bw - ax * bz;
        this[2] = az * bw + aw * bz;
        this[3] = aw * bw - az * bz;
        return this;
    }
    rotDeg(deg, axis = "y") {
        const rad = deg * Maths.DEG2RAD;
        switch (axis) {
            case "x":
                this.rotX(rad);
                break;
            case "y":
                this.rotY(rad);
                break;
            case "z":
                this.rotZ(rad);
                break;
        }
        return this;
    }
    //++++++++++++++++++++++++++++++++++
    // MULIPLYING
    /** Multiple Quaternions onto this Quaternion */
    mul(q) {
        const ax = this[0], ay = this[1], az = this[2], aw = this[3], bx = q[0], by = q[1], bz = q[2], bw = q[3];
        this[0] = ax * bw + aw * bx + ay * bz - az * by;
        this[1] = ay * bw + aw * by + az * bx - ax * bz;
        this[2] = az * bw + aw * bz + ax * by - ay * bx;
        this[3] = aw * bw - ax * bx - ay * by - az * bz;
        return this;
    }
    /** PreMultiple Quaternions onto this Quaternion */
    pmul(q) {
        const ax = q[0], ay = q[1], az = q[2], aw = q[3], bx = this[0], by = this[1], bz = this[2], bw = this[3];
        this[0] = ax * bw + aw * bx + ay * bz - az * by;
        this[1] = ay * bw + aw * by + az * bx - ax * bz;
        this[2] = az * bw + aw * bz + ax * by - ay * bx;
        this[3] = aw * bw - ax * bx - ay * by - az * bz;
        return this;
    }
    // Extra functions to perform operations that I do quite often to save from creating a new quat object
    /** Multiple an Axis Angle */
    mulAxisAngle(axis, angle) {
        const half = angle * .5, s = Math.sin(half), bx = axis[0] * s, // B Quat based on Axis Angle
        by = axis[1] * s, bz = axis[2] * s, bw = Math.cos(half), ax = this[0], // A of mul
        ay = this[1], az = this[2], aw = this[3];
        // Quat.mul( a, b );
        this[0] = ax * bw + aw * bx + ay * bz - az * by;
        this[1] = ay * bw + aw * by + az * bx - ax * bz;
        this[2] = az * bw + aw * bz + ax * by - ay * bx;
        this[3] = aw * bw - ax * bx - ay * by - az * bz;
        return this;
    }
    /** PreMultiple an Axis Angle to this quaternions */
    pmulAxisAngle(axis, angle) {
        const half = angle * .5, s = Math.sin(half), ax = axis[0] * s, // A Quat based on Axis Angle
        ay = axis[1] * s, az = axis[2] * s, aw = Math.cos(half), bx = this[0], // B of mul
        by = this[1], bz = this[2], bw = this[3];
        // Quat.mul( a, b );
        this[0] = ax * bw + aw * bx + ay * bz - az * by;
        this[1] = ay * bw + aw * by + az * bx - ax * bz;
        this[2] = az * bw + aw * bz + ax * by - ay * bx;
        this[3] = aw * bw - ax * bx - ay * by - az * bz;
        return this;
    }
    /** Inverts the quaternion passed in, then pre multiplies to this quaternion. */
    pmulInvert(q) {
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // q.invert()
        let ax = q[0], ay = q[1], az = q[2], aw = q[3];
        const dot = ax * ax + ay * ay + az * az + aw * aw;
        if (dot == 0) {
            ax = ay = az = aw = 0;
        }
        else {
            const dot_inv = 1.0 / dot;
            ax = -ax * dot_inv;
            ay = -ay * dot_inv;
            az = -az * dot_inv;
            aw = aw * dot_inv;
        }
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Quat.mul( a, b );
        const bx = this[0], by = this[1], bz = this[2], bw = this[3];
        this[0] = ax * bw + aw * bx + ay * bz - az * by;
        this[1] = ay * bw + aw * by + az * bx - ax * bz;
        this[2] = az * bw + aw * bz + ax * by - ay * bx;
        this[3] = aw * bw - ax * bx - ay * by - az * bz;
        return this;
    }
    /** Apply Unit Vector Rotation to Quaternion */
    mulUnitVecs(a, b) {
        // fromUnitVecs
        const dot = Vec3.dot(a, b);
        const ax = this[0], // A of mul
        ay = this[1], az = this[2], aw = this[3];
        let bx, by, bz, bw;
        if (dot < -0.999999) {
            const axis = Vec3.cross(Vec3.LEFT, a);
            if (axis.len() < 0.000001)
                axis.fromCross(Vec3.UP, a);
            axis.norm();
            // fromAxisAngle
            const half = Math.PI * .5, s = Math.sin(half);
            bx = axis[0] * s;
            by = axis[1] * s;
            bz = axis[2] * s;
            bw = Math.cos(half);
        }
        else if (dot > 0.999999) {
            bx = 0;
            by = 0;
            bz = 0;
            bw = 1;
        }
        else {
            const v = Vec3.cross(a, b);
            bx = v[0];
            by = v[1];
            bz = v[2];
            bw = 1 + dot;
            // Norm
            let len = bx ** 2 + by ** 2 + bz ** 2 + bw ** 2;
            if (len > 0) {
                len = 1 / Math.sqrt(len);
                bx *= len;
                by *= len;
                bz *= len;
                bw *= len;
            }
        }
        // Quat.mul( a, b );
        this[0] = ax * bw + aw * bx + ay * bz - az * by;
        this[1] = ay * bw + aw * by + az * bx - ax * bz;
        this[2] = az * bw + aw * bz + ax * by - ay * bx;
        this[3] = aw * bw - ax * bx - ay * by - az * bz;
        return this;
    }
    //#endregion ////////////////////////////////////////////////////////
    //#region STATIC
    static dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3]; }
    static lenSqr(a, b) { return (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2 + (a[3] - b[3]) ** 2; }
    static mul(a, b) {
        const rtn = new Quat();
        const ax = a[0], ay = a[1], az = a[2], aw = a[3], bx = b[0], by = b[1], bz = b[2], bw = b[3];
        rtn[0] = ax * bw + aw * bx + ay * bz - az * by;
        rtn[1] = ay * bw + aw * by + az * bx - ax * bz;
        rtn[2] = az * bw + aw * bz + ax * by - ay * bx;
        rtn[3] = aw * bw - ax * bx - ay * by - az * bz;
        return rtn;
    }
    static invert(a) {
        //https://github.com/toji/gl-matrix/blob/master/src/gl-matrix/quat.js
        const rtn = new Quat();
        const a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], dot = a0 * a0 + a1 * a1 + a2 * a2 + a3 * a3;
        if (dot == 0) {
            rtn[0] = rtn[1] = rtn[2] = rtn[3] = 0;
            return rtn;
        }
        const invDot = 1.0 / dot;
        rtn[0] = -a0 * invDot;
        rtn[1] = -a1 * invDot;
        rtn[2] = -a2 * invDot;
        rtn[3] = a3 * invDot;
        return rtn;
    }
    static fromLook(dir, up) { return new Quat().fromLook(dir, up); }
    static fromUnitVecs(a, b) {
        // Using unit vectors, Shortest rotation from Direction A to Direction B
        // http://glmatrix.net/docs/quat.js.html#line548
        // http://physicsforgames.blogspot.com/2010/03/Quat-tricks.html
        const dot = Vec3.dot(a, b);
        const rtn = new Quat();
        if (dot < -0.999999) {
            const tmp = Vec3.cross(Vec3.LEFT, a);
            if (tmp.len() < 0.000001)
                tmp.fromCross(Vec3.UP, a);
            rtn.fromAxisAngle(tmp.norm(), Math.PI);
        }
        else if (dot > 0.999999) {
            rtn[0] = 0;
            rtn[1] = 0;
            rtn[2] = 0;
            rtn[3] = 1;
        }
        else {
            const v = Vec3.cross(a, b);
            rtn[0] = v[0];
            rtn[1] = v[1];
            rtn[2] = v[2];
            rtn[3] = 1 + dot;
            rtn.norm();
        }
        return rtn;
    }
    /** Axis must be normlized  */
    static fromAxisAngle(axis, angle) {
        const half = angle * .5, s = Math.sin(half), q = new Quat();
        q[0] = axis[0] * s;
        q[1] = axis[1] * s;
        q[2] = axis[2] * s;
        q[3] = Math.cos(half);
        return q;
    }
    static fromEuler(x, y, z) { return new Quat().fromEuler(x, y, z); }
    //++++++++++++++++++++++++++++++++++
    // INTERPOLATION  
    static lerp(a, b, t, out) {
        const ti = 1 - t;
        out = out || new Quat();
        out[0] = a[0] * ti + b[0] * t;
        out[1] = a[1] * ti + b[1] * t;
        out[2] = a[2] * ti + b[2] * t;
        out[3] = a[3] * ti + b[3] * t;
        return out;
    }
    static nlerp(a, b, t, out) {
        const ti = 1 - t;
        out = out || new Quat();
        out[0] = a[0] * ti + b[0] * t;
        out[1] = a[1] * ti + b[1] * t;
        out[2] = a[2] * ti + b[2] * t;
        out[3] = a[3] * ti + b[3] * t;
        return out.norm();
    }
    static slerp(a, b, t, out) {
        // benchmarks: http://jsperf.com/Quat-slerp-implementations
        const ax = a[0], ay = a[1], az = a[2], aw = a[3];
        let bx = b[0], by = b[1], bz = b[2], bw = b[3];
        let omega, cosom, sinom, scale0, scale1;
        // calc cosine
        cosom = ax * bx + ay * by + az * bz + aw * bw;
        // adjust signs (if necessary)
        if (cosom < 0.0) {
            cosom = -cosom;
            bx = -bx;
            by = -by;
            bz = -bz;
            bw = -bw;
        }
        // calculate coefficients
        if ((1.0 - cosom) > 0.000001) {
            // standard case (slerp)
            omega = Math.acos(cosom);
            sinom = Math.sin(omega);
            scale0 = Math.sin((1.0 - t) * omega) / sinom;
            scale1 = Math.sin(t * omega) / sinom;
        }
        else {
            // "from" and "to" Quats are very close so we can do a linear interpolation
            scale0 = 1.0 - t;
            scale1 = t;
        }
        // calculate final values
        out = out || new Quat();
        out[0] = scale0 * ax + scale1 * bx;
        out[1] = scale0 * ay + scale1 * by;
        out[2] = scale0 * az + scale1 * bz;
        out[3] = scale0 * aw + scale1 * bw;
        return out;
    }
    static nblend(a, b, t, out) {
        // https://physicsforgames.blogspot.com/2010/02/quaternions.html
        const a_x = a[0], // Quaternion From
        a_y = a[1], a_z = a[2], a_w = a[3], b_x = b[0], // Quaternion To
        b_y = b[1], b_z = b[2], b_w = b[+3], dot = a_x * b_x + a_y * b_y + a_z * b_z + a_w * b_w, ti = 1 - t;
        let s = 1;
        // if Rotations with a dot less then 0 causes artifacts when lerping,
        // Can fix this by switching the sign of the To Quaternion.
        if (dot < 0)
            s = -1;
        out = out || new Quat();
        out[0] = ti * a_x + t * b_x * s;
        out[1] = ti * a_y + t * b_y * s;
        out[2] = ti * a_z + t * b_z * s;
        out[3] = ti * a_w + t * b_w * s;
        return out.norm();
    }
    static cubicSpline(a, b, c, d, t, out) {
        // B & C are the main points, A & D are the tangents
        const t2 = t * t, t3 = t * t2, a0 = d[0] - c[0] - a[0] + b[0], a1 = d[1] - c[1] - a[1] + b[1], a2 = d[2] - c[2] - a[2] + b[2], a3 = d[3] - c[3] - a[3] + b[3];
        out = out || new Quat();
        out[0] = a0 * t3 + (a[0] - b[0] - a0) * t2 + (c[0] - a[0]) * t + b[0];
        out[1] = a1 * t3 + (a[1] - b[1] - a1) * t2 + (c[1] - a[1]) * t + b[1];
        out[2] = a2 * t3 + (a[2] - b[2] - a2) * t2 + (c[2] - a[2]) * t + b[2];
        out[3] = a3 * t3 + (a[3] - b[3] - a3) * t2 + (c[3] - a[3]) * t + b[3];
        return out.norm();
    }
    //++++++++++++++++++++++++++++++++++
    // TRANSFORMATIONS
    static transformVec3(q, v, out) {
        out = out || new Vec3();
        const qx = q[0], qy = q[1], qz = q[2], qw = q[3], vx = v[0], vy = v[1], vz = v[2], x1 = qy * vz - qz * vy, y1 = qz * vx - qx * vz, z1 = qx * vy - qy * vx, x2 = qw * x1 + qy * z1 - qz * y1, y2 = qw * y1 + qz * x1 - qx * z1, z2 = qw * z1 + qx * y1 - qy * x1;
        out[0] = vx + 2 * x2;
        out[1] = vy + 2 * y2;
        out[2] = vz + 2 * z2;
        return out;
    }
}
export default Quat;
/*

    angleTo( q ) {

        return 2 * Math.acos( Math.abs( MathUtils.clamp( this.dot( q ), - 1, 1 ) ) );

    }

// Rotation Axis, The length of the vector determines how much to rotate around that axis.
// The math is very much from_axis_angle
public static Quaternion FromAngularVector( Vector3 v ){
    float len = v.magnitude;
    if (len < MathUtil.Epsilon)
    return Quaternion.identity;
    v /= len;
    float h = 0.5f * len;
    float s = Mathf.Sin(h);
    float c = Mathf.Cos(h);
    return new Quaternion(s * v.x, s * v.y, s * v.z, c);
}

public static Vector3 ToAngularVector(Quaternion q){
    Vector3 axis = GetAxis(q);
    float angle = GetAngle(q);
    return angle * axis;
}

function decompSwingTwist( q, qSwing, qTwist ){
    //q_z = ( 0, 0, z, w ) / sqrt( z^2 + w^2 )
    let denom = Math.sqrt( q[2]*q[2] + q[3]*q[3] );
    qTwist[0] = 0;
    qTwist[1] = 0;
    qTwist[2] = q[2] / denom;
    qTwist[3] = q[3] / denom;
    //q_xy = q * conjugate( q_z );
    Quat.mul( q, Quat.conjugate( qTwist ), qSwing );
}
*/
/*
//http://allenchou.net/2018/05/game-math-swing-twist-interpolation-sterp/
function get_swing_twist( q, twist_axis=Vec3.UP, out_swing, out_twist ){
    let r = new Vec3( q[0], q[1], q[2] );
    // singularity: rotation by 180 degree
    if( r.lengthSqr() < 0.00001 ){
        let t_axis = Vec3.transformQuat( twist_axis, q );
        let s_axis = Vec3.cross( twist_axis, t_axis );
        if( s_axis.lengthSqr() > 0.00001 ){
            let s_angle = Vector3.angle( twist_axis, t_axis );
            out_swing.setAxisAngle( s_axis, s_angle );
        }else{ // more singularity rotation axis parallel to twist axis
            out_swing.reset() // no swing
        }
        // always twist 180 degree on singularity
        out_twist.setAxisAngle( twist_axis, Math.PI );
        console.log("singularity");
        return;
    }
    // meat of swing-twist decomposition
    let p = vec3_project( r, twist_axis );
    out_twist.set( p[0], p[1], p[2], q[3] ).norm();
    out_swing.from_mul( Quat.invert( out_twist ), q ); //q * Quaternion.Inverse(twist);
    //out_swing.from_mul( q, Quat.invert( out_twist ) );
}


//https://github.com/libgdx/libgdx/blob/master/gdx/src/com/badlogic/gdx/math/Quat.java
//http://physicsforgames.blogspot.com/2010/03/Quat-tricks.html
//http://physicsforgames.blogspot.com/2010/02/Quats.html


/*
https://physicsforgames.blogspot.com/2010/02/quaternions.html
Quat QuatIntegrate(const Quat& q, const Vector& omega, float deltaT){
     Quat deltaQ;
     Vector theta = VecScale(omega, deltaT * 0.5f);
     float thetaMagSq = VecMagnitudeSq(theta);
     float s;
     if(thetaMagSq * thetaMagSq / 24.0f < MACHINE_SMALL_FLOAT)
     {
          deltaQ.w = 1.0f - thetaMagSq / 2.0f;
          s = 1.0f - thetaMagSq / 6.0f;
     }
     else
     {
          float thetaMag = sqrt(thetaMagSq);
          deltaQ.w = cos(thetaMag);
          s = sin(thetaMag) / thetaMag;
     }
     deltaQ.x = theta.x * s;
     deltaQ.y = theta.y * s;
     deltaQ.z = theta.z * s;
     return QuatMultiply(deltaQ, q);
}

public final Angle getRotationX(){
    double radians = Math.atan2((2.0 * this.x * this.w) - (2.0 * this.y * this.z),
                                1.0 - 2.0 * (this.x * this.x) - 2.0 * (this.z * this.z));
    if (Double.isNaN(radians))
        return null;
    return Angle.fromRadians(radians);
}

public final Angle getRotationY(){
    double radians = Math.atan2((2.0 * this.y * this.w) - (2.0 * this.x * this.z),
                                1.0 - (2.0 * this.y * this.y) - (2.0 * this.z * this.z));
    if (Double.isNaN(radians))
        return null;
    return Angle.fromRadians(radians);
}

public final Angle getRotationZ(){
    double radians = Math.asin((2.0 * this.x * this.y) + (2.0 * this.z * this.w));
    if (Double.isNaN(radians))
        return null;
    return Angle.fromRadians(radians);
}

public final LatLon getLatLon(){
    double latRadians = Math.asin((2.0 * this.y * this.w) - (2.0 * this.x * this.z));
    double lonRadians = Math.atan2((2.0 * this.y * this.z) + (2.0 * this.x * this.w),
                                    (this.w * this.w) - (this.x * this.x) - (this.y * this.y) + (this.z * this.z));
    if (Double.isNaN(latRadians) || Double.isNaN(lonRadians))
        return null;
    return LatLon.fromRadians(latRadians, lonRadians);
}
*/
/*
//https://github.com/Unity-Technologies/UnityCsReference/blob/master/Runtime/Export/Quat.cs
// Rotates the point /point/ with /rotation/.
public static Vector3 operator*(Quat rotation, Vector3 point){
    float x = rotation.x * 2F;
    float y = rotation.y * 2F;
    float z = rotation.z * 2F;
    float xx = rotation.x * x;
    float yy = rotation.y * y;
    float zz = rotation.z * z;
    float xy = rotation.x * y;
    float xz = rotation.x * z;
    float yz = rotation.y * z;
    float wx = rotation.w * x;
    float wy = rotation.w * y;
    float wz = rotation.w * z;
    Vector3 res;
    res.x = (1F - (yy + zz)) * point.x + (xy - wz) * point.y + (xz + wy) * point.z;
    res.y = (xy + wz) * point.x + (1F - (xx + zz)) * point.y + (yz - wx) * point.z;
    res.z = (xz - wy) * point.x + (yz + wx) * point.y + (1F - (xx + yy)) * point.z;
    return res;
}
*/
