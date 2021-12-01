const NORMALIZE_RGB = 1 / 255;
const COLORS = {
  "black": 0,
  "white": 16777215,
  "red": 16711680,
  "green": 65280,
  "blue": 255,
  "fuchsia": 16711935,
  "cyan": 65535,
  "yellow": 16776960,
  "orange": 16744448,
  "gray": 8421504,
  "darkgray": 3158064
};
class Colour extends Float32Array {
  constructor(c) {
    super(4);
    if (c !== void 0) {
      if (typeof c == "number" && !isNaN(c)) {
        this.fromNumber(c);
      } else if (typeof c == "string") {
        if (c.charAt(0) == "#")
          this.fromHex(c);
        else
          this.fromName(c);
      }
    }
  }
  get r() {
    return this[0];
  }
  set r(v) {
    this[0] = v;
  }
  get g() {
    return this[1];
  }
  set g(v) {
    this[1] = v;
  }
  get b() {
    return this[2];
  }
  set b(v) {
    this[2] = v;
  }
  get a() {
    return this[3];
  }
  set a(v) {
    this[3] = v;
  }
  fromName(s) {
    if (COLORS[s] !== void 0)
      this.fromNumber(COLORS[s]);
    else
      this.fromNumber(16711680);
    return this;
  }
  fromNumber(c) {
    this[0] = (c >> 16 & 255) * NORMALIZE_RGB;
    this[1] = (c >> 8 & 255) * NORMALIZE_RGB;
    this[2] = (c & 255) * NORMALIZE_RGB;
    return this;
  }
  fromHex(c) {
    if (!c || c.charAt(0) != "#") {
      console.error("Missing Pound Symbol: ", c);
      return this;
    }
    this[0] = parseInt(c[1] + c[2], 16) * NORMALIZE_RGB;
    this[1] = parseInt(c[3] + c[4], 16) * NORMALIZE_RGB;
    this[2] = parseInt(c[5] + c[6], 16) * NORMALIZE_RGB;
    if (c.length == 9)
      this[3] = parseInt(c[7] + c[8], 16) * NORMALIZE_RGB;
    return this;
  }
  fromLerp(a, b, t) {
    const ti = 1 - t;
    this[0] = a[0] * ti + b[0] * t;
    this[1] = a[1] * ti + b[1] * t;
    this[2] = a[2] * ti + b[2] * t;
    this[3] = a[3] * ti + b[3] * t;
    return this;
  }
  toRGBNumber() {
    return this[0] * 255 << 16 | this[1] * 255 << 8 | this[2] * 255;
  }
}
export default Colour;
