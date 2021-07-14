declare class Cycle {
    _value: number;
    _cycleInc: number;
    _speedScale: number;
    onUpdate?: (c: Cycle) => void;
    constructor(sec?: number);
    setSeconds(s: number): Cycle;
    /** Change Cycle to Update in a negative direction */
    backwards(): Cycle;
    /** Change Cycle to Update in a positive direction */
    forwards(): Cycle;
    /** Update the cycle using a Delta Time value, fractions of a second usually */
    update(dt: number): Cycle;
    /** Get Cycle Value, 0 to 360 degrees in radians */
    get(offset?: number): number;
    /** Get Normalized Cycle Value - Range 0:1  */
    asCycle01(offset?: number): number;
    /** Get Normalized Cycle Value - Range -1:1  */
    asCycleN11(offset?: number): number;
    /** Get Normalized Cycle Value that has been remapped into 0:1:0 */
    asCycle010(offset?: number): number;
    /** Get Cycle with sin applied. Range -1:1*/
    asSin(offset?: number): number;
    /** Get Cycle with sin applied but range remaped to 0:1 */
    asSin01(offset?: number): number;
    /** Get Cycle with sin applied but with absolute value applied. */
    asSinAbs(offset?: number): number;
    /** Get Cycle with Sigmoid curved applied. Range 0:1 */
    asSigmoid01(k?: number, offset?: number): number;
    /** Get Cycle with Sigmoid curved applied. Range 0:1:0 */
    asSigmoid010(k?: number, offset?: number): number;
}
export default Cycle;
