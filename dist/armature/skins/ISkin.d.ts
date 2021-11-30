import type Armature from '../Armature.js';
import type Pose from '../Pose.js';
interface ISkin {
    init(arm: Armature): this;
    updateFromPose(pose: Pose): this;
    getOffsets(): Array<unknown>;
}
export default ISkin;
