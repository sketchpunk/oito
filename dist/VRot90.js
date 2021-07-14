/** Handle Simple 90 Degree Rotations without the use of Quat, Trig, Matrices */
class VRot90 {
    // #region SINGLE AXIS ROTATION
    static xp(v, o) { const x = v[0], y = v[1], z = v[2]; o[0] = x; o[1] = -z; o[2] = y; return o; } // x-zy rot x+90
    static xn(v, o) { const x = v[0], y = v[1], z = v[2]; o[0] = x; o[1] = z; o[2] = -y; return o; } // xz-y rot x-90
    static x2(v, o) { const x = v[0], y = v[1], z = v[2]; o[0] = x; o[1] = -y; o[2] = -z; return o; } // x-y-z rot x+180
    static yp(v, o) { const x = v[0], y = v[1], z = v[2]; o[0] = -z; o[1] = y; o[2] = x; return o; } // -zyx rot y+90
    static yn(v, o) { const x = v[0], y = v[1], z = v[2]; o[0] = z; o[1] = y; o[2] = -x; return o; } // zy-x rot y-90
    static y2(v, o) { const x = v[0], y = v[1], z = v[2]; o[0] = -x; o[1] = y; o[2] = -z; return o; } // -xy-z rot y-180
    static zp(v, o) { const x = v[0], y = v[1], z = v[2]; o[0] = y; o[1] = -x; o[2] = z; return o; } // y-xz rot z+90
    static zn(v, o) { const x = v[0], y = v[1], z = v[2]; o[0] = -y; o[1] = x; o[2] = z; return o; } // -yxz rot z-90
    static z2(v, o) { const x = v[0], y = v[1], z = v[2]; o[0] = -x; o[1] = -y; o[2] = z; return o; } // -x-yz rot z+180
    // #endregion
    // #region COMBINATIONS
    static xp_yn(v, o) { const x = v[0], y = v[1], z = v[2]; o[0] = -y; o[1] = -z; o[2] = x; return o; } // -y-zx rot x+90, y-90
    static xp_yp(v, o) { const x = v[0], y = v[1], z = v[2]; o[0] = y; o[1] = -z; o[2] = -x; return o; } // y-z-x rot x+90, y+90
    static xp_yp_yp(v, o) { const x = v[0], y = v[1], z = v[2]; o[0] = -x; o[1] = -z; o[2] = -y; return o; } // -x-z-y rot x+90, y+90, y+90
    static xp_xp(v, o) { const x = v[0], y = v[1], z = v[2]; o[0] = x; o[1] = -y; o[2] = -z; return o; } // x-y-z rot x+90, x+90
    static yn2(v, o) { const x = v[0], y = v[1], z = v[2]; o[0] = -x; o[1] = y; o[2] = -z; return o; } // -xy-z rot y-180
}
export default VRot90;
