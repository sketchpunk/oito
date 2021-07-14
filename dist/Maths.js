// https://en.wikipedia.org/wiki/List_of_prime_numbers#The_first_1000_prime_numbers
class Maths {
    //#endregion ////////////////////////////////////////////////////////
    //#region OPERATIONS
    static clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
    static clamp01(v) { return Math.max(0, Math.min(1, v)); }
    static fract(f) { return f - Math.floor(f); }
    static near_zero(v) { return (Math.abs(v) <= Maths.EPSILON) ? 0 : v; }
    static toRad(v) { return v * Maths.DEG2RAD; }
    static toDeg(v) { return v * Maths.RAD2DEG; }
    static dotToDeg(dot) { return Maths.toDeg(Math.acos(Maths.clamp(dot, -1, 1))); }
    static map(x, xMin, xMax, zMin, zMax) {
        return (x - xMin) / (xMax - xMin) * (zMax - zMin) + zMin;
    }
    static norm(min, max, v) { return (v - min) / (max - min); }
    /** Modulas that handles Negatives
     * @example
     * Maths.mod( -1, 5 ) = 4 */
    static mod(a, b) {
        const v = a % b;
        return (v < 0) ? b + v : v;
    }
    static asinc(x0) {
        let x = 6 * (1 - x0);
        const x1 = x;
        let a = x;
        x *= x1;
        a += x / 20.0;
        x *= x1;
        a += x * 2.0 / 525.0;
        x *= x1;
        a += x * 13.0 / 37800.0;
        x *= x1;
        a += x * 4957.0 / 145530000.0;
        x *= x1;
        a += x * 58007.0 / 16216200000.0;
        x *= x1;
        a += x * 1748431.0 / 4469590125000.0;
        x *= x1;
        a += x * 4058681.0 / 92100645000000.0;
        x *= x1;
        a += x * 5313239803.0 / 1046241656460000000.0;
        x *= x1;
        a += x * 2601229460539.0 / 4365681093774000000000.0; // x^10
        return Math.sqrt(a);
    }
    //#endregion ////////////////////////////////////////////////////////
    //#region INTERPOLATION / GRADIENTS
    static lerp(a, b, t) { return (1 - t) * a + t * b; } //return a + t * (b-a); 
    /** CLerp - Circular Lerp - is like lerp but handles the wraparound from 0 to 360.
    This is useful when interpolating eulerAngles and the object crosses the 0/360 boundary. */
    static clerp(start, end, v) {
        // http://wiki.unity3d.com/index.php/Mathfx#C.23_-_Mathfx.cs
        const min = 0.0, max = 360.0, half = Math.abs((max - min) / 2.0), // half the distance between min and max
        es = end - start;
        if (es < -half)
            return start + (((max - start) + end) * v);
        else if (es > half)
            return start + (-((max - end) + start) * v);
        return start + es * v;
    }
    //#endregion ////////////////////////////////////////////////////////
    //#region GRADIENTS
    static step(edge, x) { return (x < edge) ? 0 : 1; }
    /** t must be in the range of 0 to 1 */
    static smoothTStep(t) { return t * t * (3 - 2 * t); }
    static smoothStep(edge1, edge2, val) {
        const x = Math.max(0, Math.min(1, (val - edge1) / (edge2 - edge1)));
        return x * x * (3 - 2 * x);
    }
    static gradient010(t) {
        const tt = t * 2;
        return (tt > 1) ? 1 - (tt - 1) : tt;
    }
    static bellCurve(t) {
        return (Math.sin(2 * Math.PI * (t - 0.25)) + 1) * 0.5;
    }
    /** a = 1.5, 2, 4, 9 */
    static betaDistCurve(t, a) {
        // https://stackoverflow.com/questions/13097005/easing-functions-for-bell-curves
        return 4 ** a * (t * (1 - t)) ** a;
    }
    /** bounce ease out */
    static bounce(t) {
        return (Math.sin(t * Math.PI * (0.2 + 2.5 * t * t * t)) * Math.pow(1 - t, 2.2) + t) * (1 + (1.2 * (1 - t)));
    }
    static noise(x) {
        // <https://www.shadertoy.com/view/4dS3Wd> By Morgan McGuire @morgan3d, http://graphicscodex.com
        // https://gist.github.com/patriciogonzalezvivo/670c22f3966e662d2f83
        const i = Math.floor(x);
        const f = Maths.fract(x);
        const t = f * f * (3 - 2 * f);
        return Maths.lerp(Maths.fract(Math.sin(i) * 1e4), Maths.fract(Math.sin(i + 1.0) * 1e4), t);
    }
    //#endregion ////////////////////////////////////////////////////////
    //#region TRIG
    static lawcosSSS(aLen, bLen, cLen) {
        // Law of Cosines - SSS : cos(C) = (a^2 + b^2 - c^2) / 2ab
        // The Angle between A and B with C being the opposite length of the angle.
        let v = (aLen * aLen + bLen * bLen - cLen * cLen) / (2 * aLen * bLen);
        if (v < -1)
            v = -1; // Clamp to prevent NaN Errors
        else if (v > 1)
            v = 1;
        return Math.acos(v);
    }
    //#endregion ////////////////////////////////////////////////////////
    //#region RANDOM
    static rnd(min, max) { return Math.random() * (max - min) + min; }
    static rndLcg(seed) {
        //https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
        //https://en.wikipedia.org/wiki/Lehmer_random_number_generator
        function lcg(a) { return a * 48271 % 2147483647; }
        seed = seed ? lcg(seed) : lcg(Math.random());
        return function () { return (seed = lcg(seed)) / 2147483648; };
    }
    //#endregion ////////////////////////////////////////////////////////
    //#region MISC
    static uuid() {
        let dt = new Date().getTime();
        if (window.performance && typeof window.performance.now === "function")
            dt += performance.now(); //use high-precision timer if available
        const uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
            const r = (dt + Math.random() * 16) % 16 | 0;
            dt = Math.floor(dt / 16);
            return (c == "x" ? r : (r & 0x3 | 0x8)).toString(16);
        });
        return uuid;
    }
    /** Loops between 0 and Len, once over len, starts over again at 0, like a sawtooth wave  */
    static repeat(t, len) { return Maths.clamp(t - Math.floor(t / len) * len, 0, len); }
    /** Loops back and forth between 0 and len, it functions like a triangle wave. */
    static pingPong(t, len) {
        t = Maths.repeat(t, len * 2);
        return len - Math.abs(t - len);
    }
    /** Remove Negitive Bit, then output binary string of the number */
    static dec2bin(dec) { return (dec >>> 0).toString(2); }
}
//#region CONSTANTS
Maths.PI_H = 1.5707963267948966;
Maths.PI_2 = 6.283185307179586;
Maths.PI_2_INV = 1 / 6.283185307179586;
Maths.PI_Q = 0.7853981633974483;
Maths.PI_Q3 = 1.5707963267948966 + 0.7853981633974483;
Maths.PI_270 = Math.PI + 1.5707963267948966;
Maths.DEG2RAD = 0.01745329251; // PI / 180
Maths.RAD2DEG = 57.2957795131; // 180 / PI
Maths.EPSILON = 1e-6;
export default Maths;
