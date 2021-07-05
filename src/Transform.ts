import Vec3 from "./Vec3.js";
import Quat from "./Quat.js";

// http://gabormakesgames.com/blog_transforms_transforms.html

class Transform{
    //#regin MAIN

    /** Quaternion Rotation */
    rot	= new Quat();
    /** Vector3 Position */
    pos	= new Vec3();
    /** Vector3 Scale */
    scl = new Vec3( 1, 1, 1 );

    //constructor(){}
    //#endregion ////////////////////////////////////////////////////////

    //#region SETTERS / GETTERS
    reset() : Transform{
    this.pos.xyz( 0, 0, 0 );
    this.scl.xyz( 1, 1, 1 );
    this.rot.reset();
    return this;
    }
    //#endregion ////////////////////////////////////////////////////////

    //#region OPERATORS

    //#endregion ////////////////////////////////////////////////////////

    //#region STATICS

    //#endregion ////////////////////////////////////////////////////////
}

export default Transform;