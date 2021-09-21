declare class Vec2 extends Float32Array {
    static BYTESIZE: number;
    constructor();
    constructor(v: TVec2);
    constructor(v: number);
    constructor(x: number, y: number);
    /** Set the vector components */
    xy(x: number): Vec2;
    xy(x: number, y: number): this;
    get x(): number;
    set x(v: number);
    get y(): number;
    set y(v: number);
    /** Create a new vec3 object with a copy of this vector's data */
    clone(): Vec2;
    copy(v: TVec2): this;
    /** Reset all components to zero */
    reset(): Vec2;
    /** Convert value to a string value */
    toString(rnd?: number): string;
    /** Test if all components equal zero */
    isZero(): boolean;
    /** When values are very small, like less then 0.000001, just make it zero.*/
    nearZero(x?: number, y?: number): this;
    /** Generate a random vector. Can choose per axis range */
    rnd(x0?: number, x1?: number, y0?: number, y1?: number): this;
    angle(v?: Vec2): number;
    setLen(len: number): this;
    len(): number;
    lenSqr(): number;
    fromAngleLen(ang: number, len: number): this;
    fromAdd(a: TVec2, b: TVec2): this;
    fromSub(a: TVec2, b: TVec2): this;
    fromScale(a: TVec2, s: number): this;
    fromLerp(a: TVec2, b: TVec2, t: number): this;
    fromVec3(v: TVec3, z_plane?: boolean): this;
    fromMax(a: TVec2, b: TVec2): this;
    fromMin(a: TVec2, b: TVec2): this;
    fromFloor(v: TVec2): this;
    fromFract(v: TVec2): this;
    add(v: TVec2): this;
    addRaw(x: number, y: number): this;
    sub(v: TVec2): this;
    subRaw(x: number, y: number): this;
    mul(v: TVec2): this;
    div(v: TVec2): this;
    scale(v: number): this;
    divScale(v: number): this;
    divInvScale(v: number, out: TVec2): this;
    floor(out?: TVec2): this;
    norm(out?: TVec2): this;
    lerp(v: TVec2, t: number, out?: TVec2): this;
    rotate(rad: number, out?: TVec2): this;
    rotateDeg(deg: number, out?: TVec2): this;
    invert(out?: TVec2): this;
    perpCW(): this;
    perpCCW(): this;
    static add(a: TVec2, b: TVec2): Vec2;
    static sub(a: TVec2, b: TVec2): Vec2;
    static scale(v: TVec2, s: number): Vec2;
    static floor(v: TVec2): Vec2;
    static fract(v: TVec2): Vec2;
    static lerp(v0: TVec2, v1: TVec2, t: number): Vec2;
    static len(v0: TVec2, v1: TVec2): number;
    static lenSqr(v0: TVec2, v1: TVec2): number;
    static dot(a: TVec2, b: TVec2): number;
    static det(a: TVec2, b: TVec2): number;
    static project(from: TVec2, to: TVec2): Vec2;
    static projectPlane(from: TVec2, to: TVec2, planeNorm: TVec2): Vec2;
    static rotateDeg(v: TVec2, deg: number): Vec2;
    static perpCW(v: TVec2): Vec2;
    static perpCCW(v: TVec2): Vec2;
}
export default Vec2;
