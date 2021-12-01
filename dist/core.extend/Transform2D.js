import { Vec2 } from "../core.js";
class Transform2D {
  constructor(rot, pos, scl) {
    this.rot = 0;
    this.pos = new Vec2();
    this.scl = new Vec2(1, 1);
    if (rot instanceof Transform2D) {
      this.copy(rot);
    } else if (typeof rot === "number" && pos && scl) {
      this.set(rot, pos, scl);
    }
  }
  reset() {
    this.rot = 0;
    this.pos.xy(0, 0);
    this.scl.xy(1, 1);
    return this;
  }
  copy(t) {
    this.rot = t.rot;
    this.pos.copy(t.pos);
    this.scl.copy(t.scl);
    return this;
  }
  set(r, p, s) {
    if (r != void 0 && r != null)
      this.rot = r;
    if (p)
      this.pos.copy(p);
    if (s)
      this.scl.copy(s);
    return this;
  }
  getDeg() {
    return this.rot * 180 / Math.PI;
  }
  setDeg(d) {
    this.rot = d * Math.PI / 180;
    return this;
  }
  setScl(s) {
    this.scl.xy(s);
    return this;
  }
  setPos(x, y) {
    this.pos.xy(x, y);
    return this;
  }
  clone() {
    return new Transform2D(this);
  }
  fromInvert(t) {
    this.rot = -t.rot;
    this.scl.fromInvert(t.scl);
    this.pos.fromNegate(t.pos).mul(this.scl).rotate(this.rot);
    return this;
  }
  transformVec2(v, out) {
    return (out || v).fromMul(v, this.scl).rotate(this.rot).add(this.pos);
  }
  static invert(t) {
    return new Transform2D().fromInvert(t);
  }
}
export default Transform2D;
