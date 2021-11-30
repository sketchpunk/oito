import Mat4 from '../../Mat4.js';
//#endregion
class SkinMTX {
    bind;
    world;
    offsetBuffer;
    //world ?: Array< Mat4 >;
    //constructor(){}
    init(arm) {
        const bCnt = arm.bones.length;
        const world = new Array(bCnt);
        const bind = new Array(bCnt);
        for (let i = 0; i < bCnt; i++) {
            world[i] = new Mat4();
            bind[i] = new Mat4();
        }
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        let b;
        for (let i = 0; i < bCnt; i++) {
            b = arm.bones[i];
            world[i].fromQuatTranScale(b.local.rot, b.local.pos, b.local.scl); // Local Space Matrix
            if (b.pidx != null)
                world[i].pmul(world[b.pidx]); // Add Parent if Available
            bind[i].fromInvert(world[i]); // Invert for Bind Pose
        }
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        this.bind = bind; // Save Reference to Vars
        this.world = world;
        this.offsetBuffer = new Float32Array(16 * bCnt); // Create Buffer Space
        return this;
    }
    updateFromPose(pose) {
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Get Pose Starting Offset
        const offset = new Mat4();
        offset.fromQuatTranScale(pose.offset.rot, pose.offset.pos, pose.offset.scl);
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        const bOffset = new Mat4();
        let i, b;
        for (i = 0; i < pose.bones.length; i++) {
            b = pose.bones[i];
            //----------------------------------------
            // Compute Worldspace Matrix for Each Bone
            this.world[i].fromQuatTranScale(b.local.rot, b.local.pos, b.local.scl); // Local Space Matrix
            if (b.pidx != null)
                this.world[i].pmul(this.world[b.pidx]); // Add Parent if Available
            else
                this.world[i].pmul(offset); // Or use Offset on all root bones
            //----------------------------------------
            // Compute Offset Matrix that will be used for skin a mesh
            // OffsetMatrix = Bone.WorldMatrix * Bone.BindMatrix 
            bOffset
                .fromMul(this.world[i], this.bind[i])
                .toBuf(this.offsetBuffer, i * 16);
        }
        return this;
    }
    getOffsets() {
        return [this.offsetBuffer];
    }
}
export default SkinMTX;
