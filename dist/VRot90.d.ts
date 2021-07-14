/** Handle Simple 90 Degree Rotations without the use of Quat, Trig, Matrices */
declare class VRot90 {
    static xp(v: TVec3, o: TVec3): TVec3;
    static xn(v: TVec3, o: TVec3): TVec3;
    static x2(v: TVec3, o: TVec3): TVec3;
    static yp(v: TVec3, o: TVec3): TVec3;
    static yn(v: TVec3, o: TVec3): TVec3;
    static y2(v: TVec3, o: TVec3): TVec3;
    static zp(v: TVec3, o: TVec3): TVec3;
    static zn(v: TVec3, o: TVec3): TVec3;
    static z2(v: TVec3, o: TVec3): TVec3;
    static xp_yn(v: TVec3, o: TVec3): TVec3;
    static xp_yp(v: TVec3, o: TVec3): TVec3;
    static xp_yp_yp(v: TVec3, o: TVec3): TVec3;
    static xp_xp(v: TVec3, o: TVec3): TVec3;
    static yn2(v: TVec3, o: TVec3): TVec3;
}
export default VRot90;
