declare class Vec4 extends Float32Array {
    constructor(v?: TVec4);
    xyzw(x: number, y: number, z: number, w: number): Vec4;
    get x(): number;
    set x(v: number);
    get y(): number;
    set y(v: number);
    get z(): number;
    set z(v: number);
    get w(): number;
    set w(v: number);
    clone(): Vec4;
    /** Reset all components to zero */
    reset(): Vec4;
    /** Convert value to a string value */
    toString(rnd?: number): string;
    /** Length / Magnitude squared of the vector. Good for quick simple testing */
    get lenSqr(): number;
    /** Length / Magnitude of the vector */
    len(): number;
    /** Set the Length / Magnitude of the vector */
    len(v: number): Vec4;
    /** Copy data from a struct vector type. ThreeJS compatilbility */
    fromStruct(v: TVec4Struct): Vec4;
    /** Copy data to a struct vector type. ThreeJS compatilbility */
    toStruct(v: TVec4Struct): Vec4;
    /** Copy in quaternion data */
    copy(v: TVec4): Vec4;
    /** Copy data to another quaternion. Good in chaining operations when you want a copy of a quaternion before continuing operations */
    copyTo(v: TVec4): Vec4;
    /** Used to get data from a flat buffer of vectors */
    fromBuf(ary: Array<number> | Float32Array, idx: number): Vec4;
    /** Put data into a flat buffer of vectors */
    toBuf(ary: Array<number> | Float32Array, idx: number): Vec4;
    /** Push quaternion components onto an array */
    pushTo(ary: Array<number>): Vec4;
}
export default Vec4;
