import Vec3 from "../../Vec3.js";
declare class Twist {
    startPoint: Vec3;
    endPoint: Vec3;
    startAngle: number;
    endAngle: number;
    setYRange(start: number, end: number): this;
    setAngles(startAng: number, endAng: number): this;
    apply(verts: Array<number>): void;
}
export default Twist;
