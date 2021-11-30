import Vec3 from "./Vec3.js";
import Quat from "./Quat.js";
// https://gabormakesgames.com/blog_transforms_transforms.html
// https://gabormakesgames.com/blog_transforms_transform_world.html
class Transform {
    //#region STATIC VALUES
    static BYTESIZE = 10 * Float32Array.BYTES_PER_ELEMENT;
    //#endregion ////////////////////////////////////////////////////////
    //#region MAIN
    /** Quaternion Rotation */
    rot = new Quat();
    /** Vector3 Position */
    pos = new Vec3();
    /** Vector3 Scale */
    scl = new Vec3(1, 1, 1);
    constructor(rot, pos, scl) {
        if (rot instanceof Transform) {
            this.copy(rot);
        }
        else if (rot && pos && scl) {
            this.set(rot, pos, scl);
        }
    }
    //#endregion ////////////////////////////////////////////////////////
    //#region SETTERS / GETTERS
    reset() {
        this.rot.xyzw(0, 0, 0, 1);
        this.pos.xyz(0, 0, 0);
        this.scl.xyz(1, 1, 1);
        return this;
    }
    copy(t) {
        this.rot.copy(t.rot);
        this.pos.copy(t.pos);
        this.scl.copy(t.scl);
        return this;
    }
    set(r, p, s) {
        if (r)
            this.rot.copy(r);
        if (p)
            this.pos.copy(p);
        if (s)
            this.scl.copy(s);
        return this;
    }
    clone() { return new Transform(this); }
    mul(cr, cp, cs) {
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // If just passing in Tranform Object
        if (cr instanceof Transform) {
            cp = cr.pos;
            cs = cr.scl;
            cr = cr.rot;
        }
        if (cr && cp) {
            //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            // POSITION - parent.position + ( parent.rotation * ( parent.scale * child.position ) )
            this.pos.add(Vec3.mul(this.scl, cp).transformQuat(this.rot));
            //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            // SCALE - parent.scale * child.scale
            if (cs)
                this.scl.mul(cs);
            //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            // ROTATION - parent.rotation * child.rotation
            this.rot.mul(cr);
        }
        return this;
    }
    pmul(pr, pp, ps) {
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // If just passing in Tranform Object
        if (pr instanceof Transform) {
            pp = pr.pos;
            ps = pr.scl;
            pr = pr.rot;
        }
        if (!pr || !pp || !ps)
            return this;
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // POSITION - parent.position + ( parent.rotation * ( parent.scale * child.position ) )
        // The only difference for this func, We use the IN.scl & IN.rot instead of THIS.scl * THIS.rot
        // Consider that this Object is the child and the input is the Parent.
        this.pos.mul(ps).transformQuat(pr).add(pp);
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // SCALE - parent.scale * child.scale
        if (ps)
            this.scl.mul(ps);
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // ROTATION - parent.rotation * child.rotation
        this.rot.pmul(pr); // Must Rotate from Parent->Child, need PMUL
        return this;
    }
    addPos(cp, ignoreScl = false) {
        //POSITION - parent.position + ( parent.rotation * ( parent.scale * child.position ) )
        if (ignoreScl)
            this.pos.add(Vec3.fromQuat(this.rot, cp));
        else
            this.pos.add(Vec3.mul(cp, this.scl).transformQuat(this.rot));
        return this;
    }
    //#endregion ////////////////////////////////////////////////////////
    //#region FROM OPERATORS
    fromMul(tp, tc) {
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // POSITION - parent.position + ( parent.rotation * ( parent.scale * child.position ) )
        const v = Vec3.mul(tp.scl, tc.pos).transformQuat(tp.rot); // parent.scale * child.position;
        this.pos.fromAdd(tp.pos, v);
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // SCALE - parent.scale * child.scale
        this.scl.fromMul(tp.scl, tc.scl);
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // ROTATION - parent.rotation * child.rotation
        this.rot.fromMul(tp.rot, tc.rot);
        return this;
    }
    fromInvert(t) {
        // Invert Rotation
        this.rot.fromInvert(t.rot);
        // Invert Scale
        //this.scl.x = ( t.scl.x != 0 )? 1 / t.scl.x : 0;
        //this.scl.y = ( t.scl.y != 0 )? 1 / t.scl.y : 0;
        //this.scl.z = ( t.scl.z != 0 )? 1 / t.scl.z : 0;
        this.scl.fromInvert(t.scl);
        // Invert Position : rotInv * ( invScl * -Pos )
        this.pos
            .fromNegate(t.pos)
            .mul(this.scl)
            .transformQuat(this.rot);
        return this;
    }
    //#endregion ////////////////////////////////////////////////////////
    //#region TRANSFORMATION
    transformVec3(v, out) {
        //GLSL - vecQuatRotation(model.rotation, a_position.xyz * model.scale) + model.position;
        return (out || v)
            .fromMul(v, this.scl)
            .transformQuat(this.rot)
            .add(this.pos);
    }
    //#endregion ////////////////////////////////////////////////////////
    //#region STATICS
    static mul(tp, tc) { return new Transform().fromMul(tp, tc); }
    static invert(t) { return new Transform().fromInvert(t); }
    static fromPos(x, y, z) {
        const t = new Transform();
        if (x instanceof Vec3 || x instanceof Array || x instanceof Float32Array) {
            t.pos.copy(x);
        }
        else if (x != undefined && y != undefined && z != undefined) {
            t.pos.xyz(x, y, z);
        }
        return t;
    }
}
/*
    World Space Position to Local Space.
    V	.copy( gBWorld.eye_lid_upper_mid_l.pos ) // World Space Postion
        .add( [0, -0.05 * t, 0 ] )	// Change it
        .sub( gBWorld.eye_l.pos )	// Subtract from Parent's WS Position
        .div( gBWorld.eye_l.scl )	// Div by Parent's WS Scale
        .transform_quat( gBWorld.eye_l.rot_inv );	// Rotate by Parent's WS Inverse Rotation
*/
export default Transform;
