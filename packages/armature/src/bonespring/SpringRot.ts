//#region IMPORTS
import { Quat, Transform, Vec3 }    from '@oito/core';
import type Bone                    from '../Bone';
import type Pose                    from '../Pose';
import type { ISpringType }         from './index'
import type SpringChain             from './SpringChain';
import SpringItem                   from './SpringItem';
//#endregion

class SpringRot implements ISpringType{

    setRestPose( chain: SpringChain, pose: Pose ): void{
        let si   : SpringItem;
        let b    : Bone;
        let tail = new Vec3();

        for( si of chain.items ){
            b = pose.bones[ si.index ];     // Get Pose Bone

            tail.xyz( 0, b.len, 0 );        // Tail's LocalSpace Position.
            b.world.transformVec3( tail );  // Move Tail to WorldSpace

            si.spring.reset( tail );        // Set Spring to Start at this Position.
            si.bind.copy( b.local );        // Copy LS Transform as this will be the Actual Rest Pose of the bone.
        }
    }

    updatePose( chain: SpringChain, pose: Pose, dt: number ): void{
        let si      : SpringItem;
        let b       : Bone;
        let tail    = new Vec3();
        let pTran   = new Transform();
        let cTran   = new Transform();
        let va      = new Vec3();
        let vb      = new Vec3();
        let rot     = new Quat();

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Find the Starting WorldSpace Transform
        si = chain.items[ 0 ];                                          // First Chain Link
        b  = pose.bones[ si.index ];                                    // Its Pose Bone
        if( b.pidx != null ) pTran.copy( pose.bones[ b.pidx ].world );  // Use Parent's WS Transform
        else                 pTran.copy( pose.offset );                 // Use Pose's Offset if there is no parent.

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Start Processing Chain
        for( si of chain.items ){
            b = pose.bones[ si.index ];     // Get Pose Bone

            //----------------------------------------------
            // Compute the Tail's Position as if this bone had never rotated
            // The idea is to find its resting location which will be our spring target.
            
            cTran.fromMul( pTran, si.bind );    // Compute the Bone's Resting WS Transform
            tail.xyz( 0, b.len, 0 );            // Tail's LocalSpace Position.
            cTran.transformVec3( tail );        // Move Tail to WorldSpace

            si.spring
                .setTarget( tail )              // Set new Target
                .update( dt );                  // Update Spring with new Target & DeltaTime

            //----------------------------------------------
            // Compute the rotation based on two direction, one is our bone's position toward
            // its resting tail position with the other toward our spring tail position.

            va.fromSub( tail, cTran.pos ).norm();           // Resting Ray
            vb.fromSub( si.spring.val, cTran.pos ).norm();  // Spring Ray

            rot .fromUnitVecs( va, vb )                     // Resting to Spring
                .dotNegate( cTran.rot )                     // Prevent any Artificates
                .mul( cTran.rot )                           // Apply spring rotation to our resting rotation
                .pmulInvert( pTran.rot );                   // Use parent to convert to Local Space

            //----------------------------------------------

            b.local.rot.copy( rot );                        // Save Result back to pose bone
            pTran.mul( rot, si.bind.pos, si.bind.scl );     // Using new Rotation, Move Parent WS Transform for the next item
        }
    }
}

export default SpringRot;