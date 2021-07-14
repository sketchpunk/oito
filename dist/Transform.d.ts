import Vec3 from "./Vec3.js";
import Quat from "./Quat.js";
declare class Transform {
    /** Quaternion Rotation */
    rot: Quat;
    /** Vector3 Position */
    pos: Vec3;
    /** Vector3 Scale */
    scl: Vec3;
    constructor();
    constructor(tran: Transform);
    constructor(rot: TVec4, pos: TVec3, scl: TVec3);
    reset(): Transform;
    copy(t: Transform): Transform;
    set(r?: TVec4, p?: TVec3, s?: TVec3): Transform;
    clone(): Transform;
    add(tran: Transform): Transform;
    add(cr: TVec4, cp: TVec3, cs?: TVec3): Transform;
    preAdd(tran: Transform): Transform;
    preAdd(pr: TVec4, pp: TVec3, ps: TVec3): Transform;
    addPos(cp: TVec3, ignoreScl?: boolean): Transform;
    fromAdd(tp: Transform, tc: Transform): Transform;
    fromInvert(t: Transform): Transform;
    transformVec3(v: Vec3, out?: Vec3): Vec3;
    static add(tp: Transform, tc: Transform): Transform;
    static invert(t: Transform): Transform;
    static fromPos(v: TVec3): Transform;
    static fromPos(x: number, y: number, z: number): Transform;
}
export default Transform;
