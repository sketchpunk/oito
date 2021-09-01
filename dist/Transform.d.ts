import Vec3 from "./Vec3.js";
import Quat from "./Quat.js";
declare class Transform {
    static BYTESIZE: number;
    /** Quaternion Rotation */
    rot: Quat;
    /** Vector3 Position */
    pos: Vec3;
    /** Vector3 Scale */
    scl: Vec3;
    constructor();
    constructor(tran: Transform);
    constructor(rot: TVec4, pos: TVec3, scl: TVec3);
    reset(): this;
    copy(t: Transform): this;
    set(r?: TVec4, p?: TVec3, s?: TVec3): this;
    clone(): Transform;
    mul(tran: Transform): this;
    mul(cr: TVec4, cp: TVec3, cs?: TVec3): this;
    pmul(tran: Transform): this;
    pmul(pr: TVec4, pp: TVec3, ps: TVec3): this;
    addPos(cp: TVec3, ignoreScl?: boolean): this;
    fromMul(tp: Transform, tc: Transform): this;
    fromInvert(t: Transform): this;
    transformVec3(v: Vec3, out?: Vec3): Vec3;
    static mul(tp: Transform, tc: Transform): Transform;
    static invert(t: Transform): Transform;
    static fromPos(v: TVec3): Transform;
    static fromPos(x: number, y: number, z: number): Transform;
}
export default Transform;
