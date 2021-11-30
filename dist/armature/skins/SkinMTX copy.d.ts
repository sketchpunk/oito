import type ISkin from './ISkin.js';
import type Armature from '../Armature.js';
import type Pose from '../Pose.js';
import Mat4 from '../../Mat4.js';
declare class SkinMTX implements ISkin {
    bind: Array<Mat4>;
    world: Array<Mat4>;
    offsetBuffer: Float32Array;
    init(arm: Armature): this;
    updateFromPose(pose: Pose): this;
    getOffsets(): Array<unknown>;
}
export default SkinMTX;
