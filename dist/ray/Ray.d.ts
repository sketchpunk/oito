import Vec3 from "../Vec3.js";
declare class Ray {
    origin: Vec3;
    end: Vec3;
    dir: Vec3;
    vecLen: Vec3;
    fromScreenProjection(x: number, y: number, w: number, h: number, projMatrix: TMat4, camMatrix: TMat4): Ray;
}
export default Ray;
