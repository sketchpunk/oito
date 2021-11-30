import Bone from './Bone.js';
import Pose from './Pose.js';
import Vec3 from '../Vec3.js';
//#endregion
class Armature {
    //#region MAIN
    names = new Map();
    bones = [];
    skin;
    //#endregion
    //#region METHODS
    addBone(name, pidx, rot, pos, scl) {
        const idx = this.bones.length;
        const bone = new Bone(name, idx);
        this.bones.push(bone);
        this.names.set(name, idx);
        if (pos || rot || scl)
            bone.setLocal(rot, pos, scl);
        if (pidx != null && pidx != undefined)
            bone.pidx = pidx;
        return bone;
    }
    bind(skin, defaultBoneLen = 1.0) {
        this.updateWorld(); // Compute WorldSpace Transform for all the bones
        this.updateBoneLengths(defaultBoneLen); // Compute the length of all the Bones
        if (skin)
            this.skin = new skin().init(this); // Setup Skin BindPose
        return this;
    }
    //#endregion
    //#region GETTERS
    newPose() { return new Pose(this); }
    getBone(bName) {
        const idx = this.names.get(bName);
        if (idx == undefined)
            return null;
        return this.bones[idx];
    }
    getSkinOffsets() {
        return (this.skin) ? this.skin.getOffsets() : null;
    }
    //#endregion
    //#region COMPUTE
    updateSkinFromPose(pose) {
        if (this.skin) {
            this.skin.updateFromPose(pose);
            return this.skin.getOffsets();
        }
        return null;
    }
    updateWorld() {
        const bCnt = this.bones.length;
        let b;
        for (let i = 0; i < bCnt; i++) {
            b = this.bones[i];
            if (b.pidx != null)
                b.world.fromMul(this.bones[b.pidx].world, b.local);
            else
                b.world.copy(b.local);
        }
        return this;
    }
    updateBoneLengths(defaultBoneLen = 0) {
        const bCnt = this.bones.length;
        let b, p;
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        for (let i = bCnt - 1; i >= 0; i--) {
            //-------------------------------
            b = this.bones[i];
            if (b.pidx == null)
                continue; // No Parent to compute its length.
            //-------------------------------
            // Parent Bone, Compute its length based on its position and the current bone.
            p = this.bones[b.pidx];
            p.len = Vec3.len(p.world.pos, b.world.pos);
        }
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        if (defaultBoneLen != 0) {
            for (let i = 0; i < bCnt; i++) {
                b = this.bones[i];
                if (b.len == 0)
                    b.len = defaultBoneLen;
            }
        }
        return this;
    }
}
export default Armature;
