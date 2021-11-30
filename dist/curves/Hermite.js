class Hermite {
    static at(a, b, c, d, t, tension, bias, out) {
        const t2 = t * t, t3 = t2 * t, a0 = 2 * t3 - 3 * t2 + 1, a1 = t3 - 2 * t2 + t, a2 = t3 - t2, a3 = -2 * t3 + 3 * t2;
        const ten_bias_n = (1 - bias) * (1 - tension) * 0.5;
        const ten_bias_p = (1 + bias) * (1 - tension) * 0.5;
        out ??= [0, 0, 0];
        out[0] = a0 * b[0] + a1 * ((b[0] - a[0]) * ten_bias_p + (c[0] - b[0]) * ten_bias_n) + a2 * ((c[0] - b[0]) * ten_bias_p + (d[0] - c[0]) * ten_bias_n) + a3 * c[0];
        out[1] = a0 * b[1] + a1 * ((b[1] - a[1]) * ten_bias_p + (c[1] - b[1]) * ten_bias_n) + a2 * ((c[1] - b[1]) * ten_bias_p + (d[1] - c[1]) * ten_bias_n) + a3 * c[1];
        out[2] = a0 * b[2] + a1 * ((b[2] - a[2]) * ten_bias_p + (c[2] - b[2]) * ten_bias_n) + a2 * ((c[2] - b[2]) * ten_bias_p + (d[2] - c[2]) * ten_bias_n) + a3 * c[2];
        return out;
    }
    static dxdy(a, b, c, d, t, tension, bias, out) {
        const tt = t * t, tt6 = 6 * tt, tt3 = 3 * tt, a0 = tt6 - 6 * t, a1 = tt3 - 4 * t + 1, a2 = tt3 - 2 * t, a3 = 6 * t - tt6;
        const ten_bias_n = (1 - bias) * (1 - tension) * 0.5;
        const ten_bias_p = (1 + bias) * (1 - tension) * 0.5;
        out ??= [0, 0, 0];
        out[0] = a0 * b[0] + a1 * ((b[0] - a[0]) * ten_bias_p + (c[0] - b[0]) * ten_bias_n) + a2 * ((c[0] - b[0]) * ten_bias_p + (d[0] - c[0]) * ten_bias_n) + a3 * c[0];
        out[1] = a0 * b[1] + a1 * ((b[1] - a[1]) * ten_bias_p + (c[1] - b[1]) * ten_bias_n) + a2 * ((c[1] - b[1]) * ten_bias_p + (d[1] - c[1]) * ten_bias_n) + a3 * c[1];
        out[2] = a0 * b[2] + a1 * ((b[2] - a[2]) * ten_bias_p + (c[2] - b[2]) * ten_bias_n) + a2 * ((c[2] - b[2]) * ten_bias_p + (d[2] - c[2]) * ten_bias_n) + a3 * c[2];
        return out;
    }
}
export default Hermite;
