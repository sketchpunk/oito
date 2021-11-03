import Vec3 from "../Vec3.js";
declare class Ray {
    origin: Vec3;
    end: Vec3;
    dir: Vec3;
    vecLen: Vec3;
    /** Get position of the ray from T Scale of VecLen */
    posAt(t: number, out?: TVec3): TVec3;
    /** Get position of the ray from distance from origin */
    distAt(len: number, out?: TVec3): TVec3;
    fromScreenProjection(x: number, y: number, w: number, h: number, projMatrix: TMat4, camMatrix: TMat4): Ray;
    fromEndPoints(a: TVec3, b: TVec3): this;
    nearPoint(p: TVec3, distLimit?: number): number | null;
    /** Returns [ T of Segment, T of RayLen ] */
    nearSegment(p0: TVec3, p1: TVec3): Array<number> | null;
    inPlane(planePos: TVec3, planeNorm: TVec3): number | null;
    inQuad(centerPos: TVec3, w: number, h: number): number | null;
}
export default Ray;
