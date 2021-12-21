//#region IMPORTS
import type { TVec3 }               from '@oito/type';
import type { Pose }                from '@oito/armature';
import type { IKChain }             from '../rigs/IKChain';

import { Vec3, Transform, Quat }    from '@oito/core';
import SwingTwistSolver             from './SwingTwistSolver';
import { ISolver }                  from './ISolver';
//#endregion

function lawcos_sss( aLen: number, bLen: number, cLen: number ): number{
    // Law of Cosines - SSS : cos(C) = (a^2 + b^2 - c^2) / 2ab
    // The Angle between A and B with C being the opposite length of the angle.
    let v = ( aLen*aLen + bLen*bLen - cLen*cLen ) / ( 2 * aLen * bLen );
    if( v < -1 )		v = -1;	// Clamp to prevent NaN Errors
    else if( v > 1 )	v = 1;
    return Math.acos( v );
}

class LimbSolver implements ISolver{
    _swingTwist = new SwingTwistSolver();

    initData( pose?: Pose, chain?: IKChain ): this{
        if( pose && chain ){
            this._swingTwist.initData( pose, chain );
            
            //const lnk   = chain.links[ 0 ];
            //const pole  = new Vec3( lnk.poleDir );
            //pose.bones[ lnk.idx ].world.rot.transformVec3( pole ); 
            //this.setTargetPos( chain.getTailPosition( pose ), pole );
        }
        return this;
    }

    //#region SETTING TARGET DATA
    setTargetDir( e: TVec3, pole ?: TVec3 ): this{ this._swingTwist.setTargetDir( e, pole ); return this; }
    setTargetPos( v: TVec3, pole ?: TVec3 ): this{ this._swingTwist.setTargetPos( v, pole ); return this; }
    setTargetPole( v: TVec3 ): this{ this._swingTwist.setTargetPole( v ); return this; }
    //#endregion

    resolve( chain: IKChain, pose: Pose, debug?:any ): void{
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// Start by Using SwingTwist to target the bone toward the EndEffector
        const ST          = this._swingTwist
        const [ rot, pt ] = ST.getWorldRot( chain, pose, debug );

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		let b0      = chain.links[ 0 ],
            b1		= chain.links[ 1 ],
            alen	= b0.len,
            blen	= b1.len,
            clen	= Vec3.len( ST.effectorPos, ST.originPos ),
            prot	= [0,0,0,0],
            rad     : number;
        
		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// FIRST BONE
		rad	= lawcos_sss( alen, clen, blen );               // Get the Angle between First Bone and Target.
		rot
            .pmulAxisAngle( ST.orthoDir as TVec3, -rad )   // Use the Axis X to rotate by Radian Angle
            .copyTo( prot )                                 // Save For Next Bone as Starting Point.
            .pmulInvert( pt.rot );                          // To Local

		pose.setLocalRot( b0.idx, rot );				    // Save to Pose

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// SECOND BONE
		// Need to rotate from Right to Left, So take the angle and subtract it from 180 to rotate from 
		// the other direction. Ex. L->R 70 degrees == R->L 110 degrees
		rad	= Math.PI - lawcos_sss( alen, blen, clen );
        rot
            .fromMul( prot, b1.bind.rot )                   // Get the Bind WS Rotation for this bone
            .pmulAxisAngle( ST.orthoDir as TVec3, rad )    // Rotation that needs to be applied to bone.
			.pmulInvert( prot );						    // To Local Space

		pose.setLocalRot( b1.idx, rot );                    // Save to Pose
    }
}

export default LimbSolver;