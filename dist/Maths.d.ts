declare class Maths {
    static PI_H: number;
    static PI_2: number;
    static PI_2_INV: number;
    static PI_Q: number;
    static PI_Q3: number;
    static PI_270: number;
    static DEG2RAD: number;
    static RAD2DEG: number;
    static EPSILON: number;
    static clamp(v: number, min: number, max: number): number;
    static clamp01(v: number): number;
    static fract(f: number): number;
    static near_zero(v: number): number;
    static toRad(v: number): number;
    static toDeg(v: number): number;
    static dotToDeg(dot: number): number;
    static map(x: number, xMin: number, xMax: number, zMin: number, zMax: number): number;
    static norm(min: number, max: number, v: number): number;
    /** Modulas that handles Negatives
     * @example
     * Maths.mod( -1, 5 ) = 4 */
    static mod(a: number, b: number): number;
    static asinc(x0: number): number;
    static lerp(a: number, b: number, t: number): number;
    /** CLerp - Circular Lerp - is like lerp but handles the wraparound from 0 to 360.
    This is useful when interpolating eulerAngles and the object crosses the 0/360 boundary. */
    static clerp(start: number, end: number, v: number): number;
    static step(edge: number, x: number): number;
    /** t must be in the range of 0 to 1 */
    static smoothTStep(t: number): number;
    static smoothStep(edge1: number, edge2: number, val: number): number;
    static gradient010(t: number): number;
    static bellCurve(t: number): number;
    /** a = 1.5, 2, 4, 9 */
    static betaDistCurve(t: number, a: number): number;
    /** bounce ease out */
    static bounce(t: number): number;
    static noise(x: number): number;
    static lawcosSSS(aLen: number, bLen: number, cLen: number): number;
    static rnd(min: number, max: number): number;
    static rndLcg(seed: number): () => number;
    static uuid(): string;
    static nanoId(t?: number): string;
    /** Loops between 0 and Len, once over len, starts over again at 0, like a sawtooth wave  */
    static repeat(t: number, len: number): number;
    /** Loops back and forth between 0 and len, it functions like a triangle wave. */
    static pingPong(t: number, len: number): number;
    /** Remove Negitive Bit, then output binary string of the number */
    static dec2bin(dec: number): string;
}
export default Maths;
