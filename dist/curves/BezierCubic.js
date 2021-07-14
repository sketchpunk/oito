class BezierCubic {
    static at(a, b, c, d, t, out) {
        const i = 1 - t, ii = i * i, iii = ii * i, tt = t * t, ttt = tt * t, iit3 = 3 * ii * t, itt3 = 3 * i * tt;
        out ?? (out = [0, 0, 0]);
        out[0] = iii * a[0] + iit3 * b[0] + itt3 * c[0] + ttt * d[0];
        out[1] = iii * a[1] + iit3 * b[1] + itt3 * c[1] + ttt * d[1];
        out[2] = iii * a[2] + iit3 * b[2] + itt3 * c[2] + ttt * d[2];
        return out;
    }
    static dxdy(a, b, c, d, t, out) {
        if (t > 1)
            t = 1;
        else if (t < 0)
            t = 0;
        const i = 1 - t, ii3 = 3 * i * i, it6 = 6 * i * t, tt3 = 3 * t * t;
        out ?? (out = [0, 0, 0]);
        out[0] = ii3 * (b[0] - a[0]) + it6 * (c[0] - b[0]) + tt3 * (d[0] - c[0]);
        out[1] = ii3 * (b[1] - a[1]) + it6 * (c[1] - b[1]) + tt3 * (d[1] - c[1]);
        out[2] = ii3 * (b[2] - a[2]) + it6 * (c[2] - b[2]) + tt3 * (d[2] - c[2]);
        return out;
    }
    static dxdy2(a, b, c, d, t, out) {
        // https://stackoverflow.com/questions/35901079/calculating-the-inflection-point-of-a-cubic-bezier-curve
        if (t > 1)
            t = 1;
        else if (t < 0)
            t = 0;
        const t6 = 6 * t;
        out ?? (out = [0, 0, 0]);
        out[0] = t6 * (d[0] + 3 * (b[0] - c[0]) - a[0]) + 6 * (a[0] - 2 * b[0] + c[0]);
        out[1] = t6 * (d[1] + 3 * (b[1] - c[1]) - a[1]) + 6 * (a[1] - 2 * b[1] + c[1]);
        out[2] = t6 * (d[2] + 3 * (b[2] - c[2]) - a[2]) + 6 * (a[2] - 2 * b[2] + c[2]);
        return out;
    }
}
export default BezierCubic;
