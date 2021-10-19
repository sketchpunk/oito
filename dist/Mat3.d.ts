declare class Mat3 extends Float32Array {
    static BYTESIZE: number;
    constructor();
    copy(mat: TMat3, offset?: number): this;
    identity(): this;
    determinant(): number;
    /** Frobenius norm of a Matrix */
    frob(): number;
    fromTranslation(v: TVec2): this;
    fromRotation(rad: number): this;
    fromScaling(v: TVec2): this;
    fromRotTranScale(rad: number, tran: TVec2, scl: TVec2): this;
    /** Calculates a 3x3 normal matrix (transpose inverse) from the 4x4 matrix */
    fromMat4Normal(a: TMat4): this;
    /** Generates a 2D projection matrix with the given bounds */
    fromProjection(width: number, height: number): this;
    fromAdd(a: TMat3, b: TMat3): this;
    fromSub(a: TMat3, b: TMat3): this;
    fromScalar(a: TMat3, b: number): this;
    fromMul(a: TMat3, b: TMat3): this;
    fromInvert(a: TMat3): this;
    fromTranspose(a: TMat3): this;
    fromAdjoint(a: TMat3): this;
    mul(b: TMat3): this;
    pmul(a: TMat3): this;
    invert(): this;
    transpose(): this;
    translate(v: TVec2): this;
    rotate(rad: number): this;
    scale(v: TVec2): this;
    transformVec2(v: TVec2, out?: TVec2): TVec2;
    static fromScale(v: TVec2): Mat3;
    static fromTranslation(v: TVec2): Mat3;
    static fromRotation(v: number): Mat3;
}
export default Mat3;
