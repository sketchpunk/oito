import type ISkin from './skins/ISkin.js';
import Bone from './Bone.js';
import Pose from './Pose.js';
declare class Armature {
    names: Map<string, number>;
    bones: Array<Bone>;
    skin?: ISkin;
    addBone(name: string, pidx?: number, rot?: TVec4, pos?: TVec3, scl?: TVec3): Bone;
    bind(skin?: new () => ISkin, defaultBoneLen?: number): this;
    newPose(): Pose;
    getBone(bName: string): Bone | null;
    getSkinOffsets(): Array<unknown> | null;
    updateSkinFromPose(pose: Pose): Array<unknown> | null;
    updateWorld(): this;
    updateBoneLengths(defaultBoneLen?: number): this;
}
export default Armature;
