class BezierQuad {
    static at(a, b, c, t, out) {
        // https://en.wikipedia.org/wiki/B%C3%A9zier_curve
        // (1-t) * ((1-t) * a + t * b) + t((1-t) * b + t * c)
        out ??= [0, 0, 0];
        const s = 1 - t;
        out[0] = s * (s * a[0] + t * b[0]) + t * (s * b[0] + t * c[0]);
        out[1] = s * (s * a[1] + t * b[1]) + t * (s * b[1] + t * c[1]);
        out[2] = s * (s * a[2] + t * b[2]) + t * (s * b[2] + t * c[2]);
        return out;
    }
    static dxdy(a, b, c, t, out) {
        // 2 * (1-t) * (b-a) + 2 * t * ( c - b );
        out ??= [0, 0, 0];
        const s2 = 2 * (1 - t);
        const t2 = 2 * t;
        out[0] = s2 * (b[0] - a[0]) + t2 * (c[0] - b[0]);
        out[1] = s2 * (b[1] - a[1]) + t2 * (c[1] - b[1]);
        out[2] = s2 * (b[2] - a[2]) + t2 * (c[2] - b[2]);
        return out;
    }
    static dxdy2(a, b, c, t, out) {
        // 2 * ( c - 2 * b + a )
        // -4b + 2a + 2c [ Simplifed Version ]
        out ??= [0, 0, 0];
        out[0] = -4 * b[0] + 2 * a[0] + 2 * c[0];
        out[1] = -4 * b[1] + 2 * a[1] + 2 * c[1];
        out[2] = -4 * b[2] + 2 * a[2] + 2 * c[2];
        return out;
    }
}
export default BezierQuad;
