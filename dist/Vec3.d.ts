declare class Vec3 extends Float32Array {
    static BYTESIZE: number;
    static UP: number[];
    static DOWN: number[];
    static LEFT: number[];
    static RIGHT: number[];
    static FORWARD: number[];
    static BACK: number[];
    static ZERO: number[];
    constructor();
    constructor(v: TVec3);
    constructor(v: number);
    constructor(x: number, y: number, z: number);
    /** Set the vector components */
    xyz(x: number): Vec3;
    xyz(x: number, y: number, z: number): Vec3;
    get x(): number;
    set x(v: number);
    get y(): number;
    set y(v: number);
    get z(): number;
    set z(v: number);
    /** Create a new vec3 object with a copy of this vector's data */
    clone(): Vec3;
    /** Reset all components to zero */
    reset(): Vec3;
    /** Convert value to a string value */
    toString(rnd?: number): string;
    /** Test if all components equal zero */
    isZero(): boolean;
    /** Generate a random vector. Can choose per axis range */
    rnd(x0?: number, x1?: number, y0?: number, y1?: number, z0?: number, z1?: number): Vec3;
    /** Return the Index of which axis has the smallest number */
    minAxis(): number;
    fromPolar(lon: number, lat: number): Vec3;
    /** Length / Magnitude squared of the vector. Good for quick simple testing */
    lenSqr(): number;
    /** Length / Magnitude of the vector */
    len(): number;
    /** Set the Length / Magnitude of the vector */
    len(v: number): Vec3;
    /** Copy data from a struct vector type. ThreeJS compatilbility */
    fromStruct(v: TVec3Struct): Vec3;
    /** Copy data to a struct vector type. ThreeJS compatilbility */
    toStruct(v: TVec3Struct): Vec3;
    /** Copy in vector data */
    copy(v: TVec3): Vec3;
    /** Copy data to another vector. Good in chaining operations when upi want a copy of a vec before continuing operations
     * @example
     * let backup = new Vec3()
     * let vec    = new Vec3();
     * vec.add( [1,1,1] ).copyTo( backup ).scale( 5 ); // vec continues operations after saving a copy of itself.
     */
    copyTo(v: TVec3): Vec3;
    fromVec2(v: TVec2, useZ?: boolean): this;
    /** Used to get data from a flat buffer of vectors, useful when building geometery */
    fromBuf(ary: Array<number> | Float32Array, idx: number): Vec3;
    /** Put data into a flat buffer of vectors, useful when building geometery */
    toBuf(ary: Array<number> | Float32Array, idx: number): Vec3;
    /** Pust vector components onto an array, useful when building geometery */
    pushTo(ary: Array<number>): Vec3;
    fromLerp(a: TVec3, b: TVec3, t: number): Vec3;
    fromNLerp(a: TVec3, b: TVec3, t: number): Vec3;
    fromSlerp(a: TVec3, b: TVec3, t: number): Vec3;
    fromHermite(a: TVec3, b: TVec3, c: TVec3, d: TVec3, t: number): Vec3;
    fromBezier(a: TVec3, b: TVec3, c: TVec3, d: TVec3, t: number): Vec3;
    fromCubic(a: TVec3, b: TVec3, c: TVec3, d: TVec3, t: number): Vec3;
    /** Add two vectors together */
    fromAdd(a: TVec3, b: TVec3): Vec3;
    /** Subtract two vectors together */
    fromSub(a: TVec3, b: TVec3): Vec3;
    /** Multiply two vectors together */
    fromMul(a: TVec3, b: TVec3): Vec3;
    /** Divide two vectors together */
    fromDiv(a: TVec3, b: TVec3): Vec3;
    /** Scale a vector */
    fromScale(a: TVec3, s: number): Vec3;
    /** Divide vector by a scalar value */
    fromDivScale(a: TVec3, s: number): Vec3;
    fromNorm(v: TVec3): Vec3;
    fromNegate(a: TVec3): Vec3;
    fromInvert(a: TVec3): Vec3;
    fromCross(a: TVec3, b: TVec3): Vec3;
    fromQuat(q: TVec4, v: TVec3): Vec3;
    /** Axis Rotation of a Vector */
    fromAxisAngle(axis: TVec3, rad: number, v?: number[]): Vec3;
    fromOrthogonal(v: TVec3): this;
    fromReflect(dir: TVec3, norm: TVec3): this;
    /** Add vector to current vector */
    add(a: TVec3): this;
    sub(v: TVec3): this;
    mul(v: TVec3): Vec3;
    div(v: TVec3): Vec3;
    divScale(v: number): Vec3;
    preDivScale(v: number): Vec3;
    scale(v: number): Vec3;
    invert(): Vec3;
    abs(): Vec3;
    floor(): Vec3;
    ceil(): Vec3;
    min(a: TVec3): this;
    max(a: TVec3): this;
    /** When values are very small, like less then 0.000001, just make it zero */
    nearZero(): Vec3;
    negate(): Vec3;
    norm(): Vec3;
    clamp(min: TVec3, max: TVec3): Vec3;
    snap(v: TVec3): Vec3;
    dot(b: TVec3): number;
    axisAngle(axis: TVec3, rad: number): Vec3;
    rotate(rad: number, axis?: string): Vec3;
    transformMat3(m: Array<number> | Float32Array): Vec3;
    transformMat4(m: Array<number> | Float32Array): Vec3;
    transformQuat(q: TVec4): Vec3;
    static add(a: TVec3, b: TVec3): Vec3;
    static sub(a: TVec3, b: TVec3): Vec3;
    static mul(a: TVec3, b: TVec3): Vec3;
    static divScale(a: TVec3, s: number): Vec3;
    static scale(a: TVec3, s: number): Vec3;
    static equal(a: TVec3, b: TVec3): boolean;
    static cross(a: TVec3, b: TVec3): Vec3;
    static lenSqr(a: TVec3, b: TVec3): number;
    static len(a: TVec3): number;
    static len(a: TVec3, b: TVec3): number;
    static norm(x: TVec3): Vec3;
    static norm(x: number, y: number, z: number): Vec3;
    static dot(a: TVec3, b: TVec3): number;
    static angle(a: TVec3, b: TVec3): number;
    static project(from: TVec3, to: TVec3, out?: TVec3): TVec3;
    static lerp(a: TVec3, b: TVec3, t: number): Vec3;
    static fromStruct(v: TVec3Struct): Vec3;
    static fromQuat(q: TVec4, v: TVec3): Vec3;
    /** Create an array filled with Vec3 Objects */
    static createAarray(len: number): Array<Vec3>;
    /** Create an Iterator Object that allows an easy way to loop a Float32Buffer
     * @example
     * let buf = new Float32Array( 3 * 10 );
     * for( let v of Vec3.bufIter( buf ) ) console.log( v );
    */
    static bufIter(buf: Array<number> | Float32Array): {
        [Symbol.iterator](): {
            next: () => {
                value: Vec3;
                done: boolean;
            };
        };
    };
    /** Loop through a buffer array and use a function to update each vector
     * @example
     * let verts = [ 0,0,0, 0,0,0 ];
     * let dir   = [ 0,1,0 ];
     * Vec3.bufMap( vertices, (v,i)=>v.add( dir ) ); */
    static bufMap(buf: Array<number> | Float32Array, fn: (v: Vec3, i: number) => void, startIdx?: number, endIdx?: number): void;
}
export default Vec3;
