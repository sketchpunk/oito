import Transform from '../Transform.js';
//#endregion
class Pose {
    //#region MAIN
    arm;
    bones; // Clone of Armature Bones
    offset = new Transform(); // Pose Transform Offset, useful to apply parent mesh transform
    constructor(arm) {
        const bCnt = arm.bones.length;
        this.bones = new Array(bCnt);
        this.arm = arm;
        for (let i = 0; i < bCnt; i++) {
            this.bones[i] = arm.bones[i].clone();
        }
    }
    //#endregion
    //#region GETTERS
    /** Get Bone by Name */
    get(bName) {
        const bIdx = this.arm.names.get(bName);
        return (bIdx !== undefined) ? this.bones[bIdx] : null;
    }
    //#endregion
    //#region SETTERS
    setLocalPos(bone, v) {
        const bIdx = (typeof bone === 'string') ? this.arm.names.get(bone) : bone;
        if (bIdx != undefined)
            this.bones[bIdx].local.pos.copy(v);
        return this;
    }
    setLocalRot(bone, v) {
        const bIdx = (typeof bone === 'string') ? this.arm.names.get(bone) : bone;
        if (bIdx != undefined)
            this.bones[bIdx].local.rot.copy(v);
        return this;
    }
    //#endregion
    //#region OPERATIONS
    rotLocal(bone, deg, axis = 'x') {
        const bIdx = (typeof bone === 'string') ? this.arm.names.get(bone) : bone;
        if (bIdx != undefined) {
            const q = this.bones[bIdx].local.rot;
            const rad = deg * Math.PI / 180;
            switch (axis) {
                case 'y':
                    q.rotY(rad);
                    break;
                case 'z':
                    q.rotZ(rad);
                    break;
                default:
                    q.rotX(rad);
                    break;
            }
        }
        else
            console.warn('Bone not found, ', bone);
        return this;
    }
    moveLocal(bone, offset) {
        const bIdx = (typeof bone === 'string') ? this.arm.names.get(bone) : bone;
        if (bIdx != undefined)
            this.bones[bIdx].local.pos.add(offset);
        else
            console.warn('Bone not found, ', bone);
        return this;
    }
    sclLocal(bone, v) {
        const bIdx = (typeof bone === 'string') ? this.arm.names.get(bone) : bone;
        if (bIdx != undefined) {
            if (!isNaN(v))
                this.bones[bIdx].local.scl.xyz(v, v, v);
            else
                this.bones[bIdx].local.scl.copy(v);
        }
        else
            console.warn('Bone not found, ', bone);
        return this;
    }
    //#endregion
    //#region COMPUTE
    updateWorld(useOffset = false) {
        let i, b;
        for (i = 0; i < this.bones.length; i++) {
            b = this.bones[i];
            if (b.pidx != null)
                b.world.fromMul(this.bones[b.pidx].world, b.local);
            else if (useOffset)
                b.world.fromMul(this.offset, b.local);
            else
                b.world.copy(b.local);
        }
        return this;
    }
}
export default Pose;
