import type Armature from './Armature.js';
import type Bone from './Bone.js';
import Transform from '../Transform.js';
declare class Pose {
    arm: Armature;
    bones: Array<Bone>;
    offset: Transform;
    constructor(arm: Armature);
    /** Get Bone by Name */
    get(bName: string): Bone | null;
    setLocalPos(bone: number | string, v: TVec3): this;
    setLocalRot(bone: number | string, v: TVec3): this;
    rotLocal(bone: number | string, deg: number, axis?: string): this;
    moveLocal(bone: number | string, offset: TVec3): this;
    sclLocal(bone: number | string, v: number | TVec3): this;
    updateWorld(useOffset?: boolean): this;
}
export default Pose;
