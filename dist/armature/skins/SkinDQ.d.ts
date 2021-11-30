import type ISkin from './ISkin.js';
import type Armature from '../Armature.js';
import type Pose from '../Pose.js';
import DualQuat from '../../DualQuat.js';
declare class SkinDQ implements ISkin {
    bind: Array<DualQuat>;
    world: Array<DualQuat>;
    offsetQBuffer: Float32Array;
    offsetPBuffer: Float32Array;
    init(arm: Armature): this;
    updateFromPose(pose: Pose): this;
    getOffsets(): Array<unknown>;
}
export default SkinDQ;
