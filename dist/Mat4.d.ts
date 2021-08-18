declare class Mat4 extends Float32Array {
    constructor();
    identity(): Mat4;
    clearTranslation(): Mat4;
    copy(mat: TMat4, offset?: number): Mat4;
    determinant(): number;
    /** Frobenius norm of a Matrix */
    frob(): number;
    getTranslation(out?: TVec3): TVec3;
    getScale(out?: TVec3): TVec3;
    getRotation(out?: TVec4): TVec3;
    fromPerspective(fovy: number, aspect: number, near: number, far: number): Mat4;
    fromOrtho(left: number, right: number, bottom: number, top: number, near: number, far: number): Mat4;
    fromMul(a: TMat4, b: TMat4): Mat4;
    fromInvert(mat: TMat4): Mat4;
    fromAdjugate(a: TMat4): Mat4;
    fromFrustum(left: number, right: number, bottom: number, top: number, near: number, far: number): Mat4;
    fromQuatTranScale(q: TVec4, v: TVec3, s: TVec3): Mat4;
    fromQuatTran(q: TVec4, v: TVec3): Mat4;
    fromQuat(q: TVec4): Mat4;
    /** Creates a matrix from a quaternion rotation, vector translation and vector scale, rotating and scaling around the given origin */
    fromQuatTranScaleOrigin(q: TVec4, v: TVec3, s: TVec3, o: TVec3): Mat4;
    fromDualQuat(a: TVec8): Mat4;
    /** This creates a View Matrix, not a World Matrix. Use fromTarget for a World Matrix */
    fromLook(eye: TVec3, center: TVec3, up: TVec3): Mat4;
    /** This creates a World Matrix, not a View Matrix. Use fromLook for a View Matrix */
    fromTarget(eye: TVec3, target: TVec3, up: TVec3): Mat4;
    fromAxisAngle(axis: TVec3, rad: number): Mat4;
    fromRotX(rad: number): Mat4;
    fromRotY(rad: number): Mat4;
    fromRotZ(rad: number): Mat4;
    toNormalMat3(out?: TMat3): TMat3;
    /** Used to get data from a flat buffer of matrices */
    fromBuf(ary: Array<number> | Float32Array, idx: number): Mat4;
    /** Put data into a flat buffer of matrices */
    toBuf(ary: Array<number> | Float32Array, idx: number): Mat4;
    add(b: TMat4): Mat4;
    sub(b: TMat4): Mat4;
    mul(b: TMat4): Mat4;
    invert(): Mat4;
    translate(x: TVec3): Mat4;
    translate(x: number, y: number, z: number): Mat4;
    scale(x: number): Mat4;
    scale(x: number, y: number, z: number): Mat4;
    /** Make the rows into the columns */
    transpose(): Mat4;
    decompose(out_r: TVec4, out_t: TVec3, out_s: TVec3): Mat4;
    rotX(rad: number): Mat4;
    rotY(rad: number): Mat4;
    rotZ(rad: number): Mat4;
    rotAxisAngle(axis: TVec3, rad: number): Mat4;
    transformVec3(v: TVec3, out?: TVec3): TVec3;
    transformVec4(v: TVec4, out?: TVec4): TVec4;
}
export default Mat4;
