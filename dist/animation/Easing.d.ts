declare class Easing {
    static quad_In(k: number): number;
    static quad_Out(k: number): number;
    static quad_InOut(k: number): number;
    static cubic_In(k: number): number;
    static cubic_Out(k: number): number;
    static cubic_InOut(k: number): number;
    static quart_In(k: number): number;
    static quart_Out(k: number): number;
    static quart_InOut(k: number): number;
    static quint_In(k: number): number;
    static quint_Out(k: number): number;
    static quint_InOut(k: number): number;
    static sine_In(k: number): number;
    static sine_Out(k: number): number;
    static sine_InOut(k: number): number;
    static exp_In(k: number): number;
    static exp_Out(k: number): number;
    static exp_InOut(k: number): number;
    static circ_In(k: number): number;
    static circ_Out(k: number): number;
    static circ_InOut(k: number): number;
    static elastic_In(k: number): number;
    static elastic_Out(k: number): number;
    static elastic_InOut(k: number): number;
    static back_In(k: number): number;
    static back_Out(k: number): number;
    static back_InOut(k: number): number;
    static bounce_In(k: number): number;
    static bounce_Out(k: number): number;
    static bounce_InOut(k: number): number;
    static smoothTStep(t: number): number;
    static sigmoid(t: number, k?: number): number;
    static bellCurve(t: number): number;
    /** a = 1.5, 2, 4, 9 */
    static betaDistCurve(t: number, a: number): number;
    static bouncy(t: number, jump?: number, offset?: number): number;
    /** bounce ease out */
    static bounce(t: number): number;
}
export default Easing;
