class VRot90 {
  static xp(v, o) {
    const x = v[0], y = v[1], z = v[2];
    o[0] = x;
    o[1] = -z;
    o[2] = y;
    return o;
  }
  static xn(v, o) {
    const x = v[0], y = v[1], z = v[2];
    o[0] = x;
    o[1] = z;
    o[2] = -y;
    return o;
  }
  static x2(v, o) {
    const x = v[0], y = v[1], z = v[2];
    o[0] = x;
    o[1] = -y;
    o[2] = -z;
    return o;
  }
  static yp(v, o) {
    const x = v[0], y = v[1], z = v[2];
    o[0] = -z;
    o[1] = y;
    o[2] = x;
    return o;
  }
  static yn(v, o) {
    const x = v[0], y = v[1], z = v[2];
    o[0] = z;
    o[1] = y;
    o[2] = -x;
    return o;
  }
  static y2(v, o) {
    const x = v[0], y = v[1], z = v[2];
    o[0] = -x;
    o[1] = y;
    o[2] = -z;
    return o;
  }
  static zp(v, o) {
    const x = v[0], y = v[1], z = v[2];
    o[0] = y;
    o[1] = -x;
    o[2] = z;
    return o;
  }
  static zn(v, o) {
    const x = v[0], y = v[1], z = v[2];
    o[0] = -y;
    o[1] = x;
    o[2] = z;
    return o;
  }
  static z2(v, o) {
    const x = v[0], y = v[1], z = v[2];
    o[0] = -x;
    o[1] = -y;
    o[2] = z;
    return o;
  }
  static xp_yn(v, o) {
    const x = v[0], y = v[1], z = v[2];
    o[0] = -y;
    o[1] = -z;
    o[2] = x;
    return o;
  }
  static xp_yp(v, o) {
    const x = v[0], y = v[1], z = v[2];
    o[0] = y;
    o[1] = -z;
    o[2] = -x;
    return o;
  }
  static xp_yp_yp(v, o) {
    const x = v[0], y = v[1], z = v[2];
    o[0] = -x;
    o[1] = -z;
    o[2] = -y;
    return o;
  }
  static xp_xp(v, o) {
    const x = v[0], y = v[1], z = v[2];
    o[0] = x;
    o[1] = -y;
    o[2] = -z;
    return o;
  }
  static yn2(v, o) {
    const x = v[0], y = v[1], z = v[2];
    o[0] = -x;
    o[1] = y;
    o[2] = -z;
    return o;
  }
}
export default VRot90;
