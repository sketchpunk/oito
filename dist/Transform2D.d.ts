import Vec2 from "./Vec2.js";
declare class Transform2D {
    /** Rotation in Radians */
    rot: number;
    /** Vector2 Position */
    pos: Vec2;
    /** Vector2 Scale */
    scl: Vec2;
    constructor();
    constructor(tran: Transform2D);
    constructor(rot: TVec4, pos: TVec3, scl: TVec3);
    reset(): this;
    copy(t: Transform2D): this;
    set(r?: number, p?: TVec2, s?: TVec2): this;
    getDeg(): number;
    setDeg(d: number): this;
    setScl(s: number): this;
    setPos(x: number, y: number): this;
    clone(): Transform2D;
    fromInvert(t: Transform2D): this;
    transformVec2(v: Vec2, out?: Vec2): Vec2;
    static invert(t: Transform2D): Transform2D;
}
export default Transform2D;
