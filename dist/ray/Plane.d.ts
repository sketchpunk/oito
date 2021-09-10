import Vec3 from "../Vec3.js";
declare class Plane {
    pos: Vec3;
    normal: Vec3;
    constant: number;
    fromNormAndPos(norm: TVec3, pos: TVec3): Plane;
    negate(): Plane;
    norm(): Plane;
    translate(offset: TVec3): Plane;
    distanceToPoint(pos: TVec3): number;
    distanceToSphere(spherePos: TVec3, radius: number): number;
    projectPoint(pos: TVec3, out: Vec3): Vec3;
}
export default Plane;
