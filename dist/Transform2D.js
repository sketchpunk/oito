import Vec2 from "./Vec2.js";
class Transform2D {
    constructor(rot, pos, scl) {
        //#region MAIN
        /** Rotation in Radians */
        this.rot = 0;
        /** Vector2 Position */
        this.pos = new Vec2();
        /** Vector2 Scale */
        this.scl = new Vec2(1, 1);
        if (rot instanceof Transform2D) {
            this.copy(rot);
        }
        else if (rot && pos && scl) {
            this.set(rot, pos, scl);
        }
    }
    //#endregion ////////////////////////////////////////////////////////
    //#region SETTERS / GETTERS
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
        if (r != undefined && r != null)
            this.rot = r;
        if (p)
            this.pos.copy(p);
        if (s)
            this.scl.copy(s);
        return this;
    }
    getDeg() { return this.rot * 180 / Math.PI; }
    setDeg(d) { this.rot = d * Math.PI / 180; return this; }
    setScl(s) { this.scl.xy(s); return this; }
    setPos(x, y) { this.pos.xy(x, y); return this; }
    clone() { return new Transform2D(this); }
    //#endregion ////////////////////////////////////////////////////////
    //#region FROM OPS
    fromInvert(t) {
        // Invert Rotation
        this.rot = -t.rot;
        // Invert Scale
        this.scl.fromInvert(t.scl); // 1 / value
        // Invert Position : rotInv * ( invScl * -Pos )
        this.pos
            .fromNegate(t.pos)
            .mul(this.scl)
            .rotate(this.rot);
        return this;
    }
    //#endregion ////////////////////////////////////////////////////////
    //#region TRANSFORMATION
    transformVec2(v, out) {
        //GLSL - vecQuatRotation(model.rotation, a_position.xyz * model.scale) + model.position;
        return (out || v)
            .fromMul(v, this.scl)
            .rotate(this.rot)
            .add(this.pos);
    }
    //#endregion ////////////////////////////////////////////////////////
    //#region STATIC
    static invert(t) { return new Transform2D().fromInvert(t); }
}
export default Transform2D;
