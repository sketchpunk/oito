//#region IMPORTS
import type Armature        from '../Armature.js';
import type Pose            from '../Pose.js';
//#endregion

export interface ISkin{
    init( arm: Armature ): this;
    updateFromPose( pose: Pose ): this;
    getOffsets(): Array< unknown >;
    getTextureInfo( frameCount: number ): TTextureInfo;
}

export type TTextureInfo = {
    boneCount           : number,
    strideFloatLength   : number,
    strideByteLength    : number,
    pixelsPerStride     : number,
    floatRowSize        : number,
    bufferFloatSize     : number,
    bufferByteSize      : number,
    pixelWidth          : number,
    pixelHeight         : number,
};

// Matrix           (MTX)
// -- Bind Pose as Matrix

// Dual Quaternions (DQ)
// -- Bind Pose as DQ

// DQ Transform     (DQT)
// -- Bind Pose as Transform
