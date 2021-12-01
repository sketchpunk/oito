var _Maths = class {
  static clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }
  static clamp01(v) {
    return Math.max(0, Math.min(1, v));
  }
  static fract(f) {
    return f - Math.floor(f);
  }
  static near_zero(v) {
    return Math.abs(v) <= _Maths.EPSILON ? 0 : v;
  }
  static toRad(v) {
    return v * _Maths.DEG2RAD;
  }
  static toDeg(v) {
    return v * _Maths.RAD2DEG;
  }
  static dotToDeg(dot) {
    return _Maths.toDeg(Math.acos(_Maths.clamp(dot, -1, 1)));
  }
  static map(x, xMin, xMax, zMin, zMax) {
    return (x - xMin) / (xMax - xMin) * (zMax - zMin) + zMin;
  }
  static snap(x, step) {
    return Math.floor(x / step) * step;
  }
  static norm(min, max, v) {
    return (v - min) / (max - min);
  }
  static mod(a, b) {
    const v = a % b;
    return v < 0 ? b + v : v;
  }
  static asinc(x0) {
    let x = 6 * (1 - x0);
    const x1 = x;
    let a = x;
    x *= x1;
    a += x / 20;
    x *= x1;
    a += x * 2 / 525;
    x *= x1;
    a += x * 13 / 37800;
    x *= x1;
    a += x * 4957 / 14553e4;
    x *= x1;
    a += x * 58007 / 162162e5;
    x *= x1;
    a += x * 1748431 / 4469590125e3;
    x *= x1;
    a += x * 4058681 / 92100645e6;
    x *= x1;
    a += x * 5313239803 / 104624165646e7;
    x *= x1;
    a += x * 2601229460539 / 4365681093774e9;
    return Math.sqrt(a);
  }
  static wrap(value, min, max) {
    const range = max - min;
    return range != 0 ? value - range * Math.floor((value - min) / range) : min;
  }
  static damp(x, y, lambda, dt) {
    const ti = Math.exp(-lambda * dt);
    return x * ti + y * (1 - ti);
  }
  static negateIf(val, b) {
    return b ? -val : val;
  }
  static lerp(a, b, t) {
    return (1 - t) * a + t * b;
  }
  static clerp(start, end, v) {
    const min = 0, max = 360, half = Math.abs((max - min) / 2), es = end - start;
    if (es < -half)
      return start + (max - start + end) * v;
    else if (es > half)
      return start + -(max - end + start) * v;
    return start + es * v;
  }
  static lawcosSSS(aLen, bLen, cLen) {
    let v = (aLen * aLen + bLen * bLen - cLen * cLen) / (2 * aLen * bLen);
    if (v < -1)
      v = -1;
    else if (v > 1)
      v = 1;
    return Math.acos(v);
  }
  static rnd(min, max) {
    return Math.random() * (max - min) + min;
  }
  static rndLcg(seed) {
    function lcg(a) {
      return a * 48271 % 2147483647;
    }
    seed = seed ? lcg(seed) : lcg(Math.random());
    return function() {
      return (seed = lcg(seed)) / 2147483648;
    };
  }
  static repeat(t, len) {
    return _Maths.clamp(t - Math.floor(t / len) * len, 0, len);
  }
  static pingPong(t, len) {
    t = _Maths.repeat(t, len * 2);
    return len - Math.abs(t - len);
  }
  static dec2bin(dec) {
    return (dec >>> 0).toString(2);
  }
};
var Maths = _Maths;
Maths.PI_H = 1.5707963267948966;
Maths.PI_2 = 6.283185307179586;
Maths.PI_2_INV = 1 / 6.283185307179586;
Maths.PI_Q = 0.7853981633974483;
Maths.PI_Q3 = 1.5707963267948966 + 0.7853981633974483;
Maths.PI_270 = Math.PI + 1.5707963267948966;
Maths.DEG2RAD = 0.01745329251;
Maths.RAD2DEG = 57.2957795131;
Maths.EPSILON = 1e-6;
Maths.PHI = 1.618033988749895;
var maths_default = Maths;
var Gradient = class {
  static step(edge, x) {
    return x < edge ? 0 : 1;
  }
  static smoothTStep(t) {
    return t * t * (3 - 2 * t);
  }
  static smoothStep(min, max, v) {
    v = Math.max(0, Math.min(1, (v - min) / (max - min)));
    return v * v * (3 - 2 * v);
  }
  static smootherStep(min, max, v) {
    if (v <= min)
      return 0;
    if (v >= max)
      return 1;
    v = (v - min) / (max - min);
    return v * v * v * (v * (v * 6 - 15) + 10);
  }
  static smoothMin(a, b, k) {
    if (k != 0) {
      const h = Math.max(k - Math.abs(a - b), 0) / k;
      return Math.min(a, b) - h * h * h * k * (1 / 6);
    } else
      return Math.min(a, b);
  }
  static fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }
  static gradient010(t) {
    const tt = t * 2;
    return tt > 1 ? 1 - (tt - 1) : tt;
  }
  static bounce(t) {
    return (Math.sin(t * Math.PI * (0.2 + 2.5 * t * t * t)) * Math.pow(1 - t, 2.2) + t) * (1 + 1.2 * (1 - t));
  }
  static noise(x) {
    const i = Math.floor(x);
    const f = maths_default.fract(x);
    const t = f * f * (3 - 2 * f);
    return maths_default.lerp(maths_default.fract(Math.sin(i) * 1e4), maths_default.fract(Math.sin(i + 1) * 1e4), t);
  }
  static parabola(x, k) {
    return Math.pow(4 * x * (1 - x), k);
  }
  static sigmoid(t, k = 0) {
    return (t - k * t) / (k - 2 * k * Math.abs(t) + 1);
  }
  static bellCurve(t) {
    return (Math.sin(2 * Math.PI * (t - 0.25)) + 1) * 0.5;
  }
  static betaDistCurve(t, a) {
    return 4 ** a * (t * (1 - t)) ** a;
  }
};
var gradient_default = Gradient;
var src_default = maths_default;
export {
  gradient_default as Gradient,
  maths_default as Maths,
  src_default as default
};
