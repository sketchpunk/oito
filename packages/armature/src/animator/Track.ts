//#region IMPORTS
import { Vec3, Quat }       from '@oito/core'
import type Pose            from '../Pose';
import type { FrameInfo }   from './Animator';
import TypePool             from './TypePool';
//#endregion

//#region TYPES / INTERFACES
type Lerp = typeof ELerp[ keyof typeof ELerp ];
export const ELerp = {
    Step    : 0,
    Linear  : 1,
    Cubic   : 2,
} as const;

export interface ITrack{
    name            : string;
    timeStampIndex  : number;
    values          : Float32Array;
    boneIndex       : number;
    fnLerp          : fnInterp<any>

    apply( pose: Pose, fi: FrameInfo ): this;

    setInterpolation( i: Lerp ): this;
}
//#endregion

//#region LERP FUNCTIONS

type fnInterp<T> = ( track: ITrack, fi: FrameInfo, out: T ) => T;

function vec3_step( track: ITrack, fi: FrameInfo, out: Vec3 ) : Vec3{
    return out.fromBuf( track.values, fi.k0 * 3 );
}

function vec3_linear( track: ITrack, fi: FrameInfo, out: Vec3 ) : Vec3{
    const v0 = TypePool.vec3();
    const v1 = TypePool.vec3();

    v0.fromBuf( track.values, fi.k0 * 3 );
    v1.fromBuf( track.values, fi.k1 * 3 );
    out.fromLerp( v0, v1, fi.t );

    TypePool.recycle_vec3( v0, v1 );
    return out;
}

function quat_step( track: ITrack, fi: FrameInfo, out: Quat ) : Quat{
    return out.fromBuf( track.values, fi.k0 * 4 );
}

function quat_linear( track: ITrack, fi: FrameInfo, out: Quat ) : Quat{
    const v0 = TypePool.quat();
    const v1 = TypePool.quat();

    v0.fromBuf( track.values, fi.k0 * 4 );
    v1.fromBuf( track.values, fi.k1 * 4 );
    out.fromNBlend( v0, v1, fi.t ); // TODO: Maybe Slerp?

    TypePool.recycle_quat( v0, v1 );
    return out;
}

//#endregion


export class Vec3Track implements ITrack{
    name            : string = 'Vec3Track';
    values         !: Float32Array;
    boneIndex       = -1;
    timeStampIndex  = -1;
    fnLerp          : fnInterp<Vec3> = vec3_linear;

    setInterpolation( i: Lerp ): this {
        switch( i ){
            case ELerp.Step     : this.fnLerp = vec3_step; break;
            case ELerp.Linear   : this.fnLerp = vec3_linear; break;
            case ELerp.Cubic    : console.warn( 'Vec3 Cubic Lerp Not Implemented' ); break;
        }
        return this;
    }

    apply( pose: Pose, fi: FrameInfo ): this{
        const v = TypePool.vec3();
        pose.setLocalPos( this.boneIndex, this.fnLerp( this, fi, v ) );
        TypePool.recycle_vec3( v );
        return this;
    }
}

export class QuatTrack implements ITrack{
    name            : string = 'QuatTrack';
    values         !: Float32Array;
    boneIndex       = -1;
    timeStampIndex  = -1;
    fnLerp          : fnInterp<Quat> = quat_linear;

    setInterpolation( i: Lerp ): this {
        switch( i ){
            case ELerp.Step     : this.fnLerp = quat_step; break;
            case ELerp.Linear   : this.fnLerp = quat_linear; break;
            case ELerp.Cubic    : console.warn( 'Quat Cubic Lerp Not Implemented' ); break;
        }
        return this;
    }

    apply( pose: Pose, fi: FrameInfo ): this{
        const v = TypePool.quat();
        pose.setLocalRot( this.boneIndex, this.fnLerp( this, fi, v  ) );
        TypePool.recycle_quat( v );
        return this;
    }
}