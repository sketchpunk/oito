declare class DualQuat extends Float32Array {
    static BYTESIZE: number;
    constructor();
    constructor(q: TVec4);
    constructor(q: TVec4, t: TVec3);
    reset(): DualQuat;
    clone(): DualQuat;
    copy(a: TVec8): DualQuat;
    lenSqr(): number;
    /** DUAL Part of DQ */
    getTranslation(out?: TVec3): TVec3;
    /** REAL Part of DQ */
    getQuat(out?: TVec4): TVec4;
    /** Used to get data from a flat buffer of dualquat */
    fromBuf(ary: Array<number> | Float32Array, idx: number): DualQuat;
    /** Put data into a flat buffer of dualquat */
    toBuf(ary: Array<number> | Float32Array, idx: number): DualQuat;
    /** Create a DualQuat from Quaternion and Translation Vector */
    fromQuatTran(q: TVec4, t: TVec4): DualQuat;
    fromTranslation(t: TVec3): DualQuat;
    fromQuat(q: TVec4): DualQuat;
    fromMul(a: TVec8, b: TVec8): DualQuat;
    fromNorm(a: TVec8): DualQuat;
    /** If dual quaternion is normalized, this is faster than inverting and produces the same value. */
    fromConjugate(a: TVec8): DualQuat;
    add(q: TVec8): DualQuat;
    mul(q: TVec8): DualQuat;
    pmul(q: TVec8): DualQuat;
    scale(s: number): DualQuat;
    norm(): DualQuat;
    /** Calculates the inverse of a dual quat. If they are normalized, conjugate is cheaper */
    invert(): DualQuat;
    /** If dual quaternion is normalized, this is faster than inverting and produces the same value. */
    conjugate(): DualQuat;
    /** Translates a dual quat by the given vector */
    translate(v: TVec3): DualQuat;
    /** Rotates a dual quat by a given quaternion (dq * q) */
    mulQuat(q: TVec4): DualQuat;
    /** Rotates a dual quat by a given quaternion (q * dq) */
    pmulQuat(q: TVec4): DualQuat;
    rotX(rad: number): DualQuat;
    rotY(rad: number): DualQuat;
    rotZ(rad: number): DualQuat;
    /** Rotates a dual quat around a given axis. Does the normalisation automatically */
    rotAxisAngle(axis: TVec3, rad: number): DualQuat;
    transformVec3(v: TVec3, out?: TVec3): TVec3;
}
export default DualQuat;
