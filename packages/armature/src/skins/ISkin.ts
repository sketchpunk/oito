//#region IMPORTS
import type Armature from '../Armature.js';
import type Pose     from '../Pose.js';
//#endregion

interface ISkin{
    init( arm: Armature ): this;
    updateFromPose( pose: Pose ): this;
    getOffsets(): Array< unknown >;
}

// Matrix           (MTX)
// -- Bind Pose as Matrix

// Dual Quaternions (DQ)
// -- Bind Pose as DQ

// DQ Transform     (DQT)
// -- Bind Pose as Transform

export default ISkin;