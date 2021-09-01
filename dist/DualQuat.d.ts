declare class DualQuat extends Float32Array {
    static BYTESIZE: number;
    constructor();
    constructor(q: TVec4);
    constructor(q: TVec4, t: TVec3);
    reset(): this;
    clone(): DualQuat;
    copy(a: TVec8): this;
    lenSqr(): number;
    /** DUAL Part of DQ */
    getTranslation(out?: TVec3): TVec3;
    /** REAL Part of DQ */
    getQuat(out?: TVec4): TVec4;
    /** Used to get data from a flat buffer of dualquat */
    fromBuf(ary: Array<number> | Float32Array, idx: number): this;
    /** Put data into a flat buffer of dualquat */
    toBuf(ary: Array<number> | Float32Array, idx: number): this;
    /** Create a DualQuat from Quaternion and Translation Vector */
    fromQuatTran(q: TVec4, t: TVec4): this;
    fromTranslation(t: TVec3): this;
    fromQuat(q: TVec4): this;
    fromMul(a: TVec8, b: TVec8): this;
    fromNorm(a: TVec8): this;
    /** If dual quaternion is normalized, this is faster than inverting and produces the same value. */
    fromConjugate(a: TVec8): this;
    add(q: TVec8): this;
    mul(q: TVec8): this;
    pmul(q: TVec8): this;
    scale(s: number): this;
    norm(): this;
    /** Calculates the inverse of a dual quat. If they are normalized, conjugate is cheaper */
    invert(): this;
    /** If dual quaternion is normalized, this is faster than inverting and produces the same value. */
    conjugate(): this;
    /** Translates a dual quat by the given vector */
    translate(v: TVec3): this;
    /** Rotates a dual quat by a given quaternion (dq * q) */
    mulQuat(q: TVec4): this;
    /** Rotates a dual quat by a given quaternion (q * dq) */
    pmulQuat(q: TVec4): this;
    rotX(rad: number): this;
    rotY(rad: number): this;
    rotZ(rad: number): this;
    /** Rotates a dual quat around a given axis. Does the normalisation automatically */
    rotAxisAngle(axis: TVec3, rad: number): this;
    transformVec3(v: TVec3, out?: TVec3): TVec3;
}
export default DualQuat;
