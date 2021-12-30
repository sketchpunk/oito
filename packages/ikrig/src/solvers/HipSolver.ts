//#region IMPORTS
import type { TVec3 }               from "@oito/type";
import type { Pose }                from "@oito/armature";
import type { IKChain }             from "../rigs/IKChain";
import type { IKData }              from '..';

import { Vec3, Transform, Quat }    from "@oito/core";
import SwingTwistSolver             from "./SwingTwistSolver";
//#endregion

class HipSolver{
    //#region MAIN
    isAbs       = true;
    position    = [0,0,0];
    bindHeight  = 0;
    _swingTwist = new SwingTwistSolver();

    initData( pose ?: Pose, chain ?: IKChain ): this{
        if( pose && chain ){
            const b = pose.bones[ chain.links[ 0 ].idx ];
            this.setMovePos( b.world.pos, true );

            this._swingTwist.initData( pose, chain );
        }
        return this;
    }
    //#endregion

    //#region SETTING TARGET DATA
    setTargetDir( e: TVec3, pole ?: TVec3 ): this{ this._swingTwist.setTargetDir( e, pole ); return this; }
    setTargetPos( v: TVec3, pole ?: TVec3 ): this{ this._swingTwist.setTargetPos( v, pole ); return this; }
    setTargetPole( v: TVec3 ): this{ this._swingTwist.setTargetPole( v ); return this; }

    setMovePos( pos: TVec3, isAbs=true, bindHeight=0 ): this{
        this.position[ 0 ]  = pos[ 0 ];
        this.position[ 1 ]  = pos[ 1 ];
        this.position[ 2 ]  = pos[ 2 ];
        this.isAbs          = isAbs;
        this.bindHeight     = bindHeight;
        return this;
    }
    //#endregion

    resolve( chain: IKChain, pose: Pose, debug?:any ): void{
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        const pt        = new Transform();
        const ptInv     = new Transform();
        const hipPos    = new Vec3();
        const lnk       = chain.first();

        // Get the Starting Transform
        if( lnk.pidx == -1 )    pt.copy( pose.offset );
        else                    pose.getWorldTransform( lnk.pidx, pt );

        ptInv.fromInvert( pt ); // Invert Transform to Translate Position to Local Space

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Which Position Type Are we handling?

        if( this.isAbs ){

            hipPos.copy( this.position );               // Set Absolute Position of where the hip must be

        }else{
            const ct = new Transform();
            ct.fromMul( pt, lnk.bind );                 // Get Bone's BindPose position in relation to this pose

            if( this.bindHeight == 0 ){
                hipPos.fromAdd( ct.pos, this.position );    // Add Offset Position
            }else{
                // Need to scale offset position in relation to the Hip Height of the Source
                hipPos.fromScale( this.position, Math.abs( ct.pos[ 1 ] / this.bindHeight ) ).add( ct.pos );
            }
            //debug.pnt.add( ct.pos, 0x00ffff, 1 );
        }

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        ptInv.transformVec3( hipPos );                  // To Local Space
        pose.setLocalPos( lnk.idx, hipPos );

        this._swingTwist.resolve( chain, pose, debug ); // Apply SwingTwist Rotation
    }

    ikDataFromPose( chain: IKChain, pose: Pose, out: IKData.Hip ): void{
        const v     = new Vec3();
        const lnk   = chain.first();
        const b     = pose.bones[ lnk.idx ];
        const tran  = new Transform();

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Figure out the Delta Change of the Hip Position from its Bind Pose to its Animated Pose

        if( b.pidx == null ) tran.fromMul( pose.offset, lnk.bind );                     // Use Offset if there is no parent
        else                 pose.getWorldTransform( lnk.pidx, tran ).mul( lnk.bind );  // Compute Parent's WorldSpace transform, then add local bind pose to it.

        v.fromSub( b.world.pos, tran.pos ); // Position Change from Bind Pose

        out.isAbsolute = false;             // This isn't an absolute Position, its a delta change
        out.bindHeight = tran.pos[ 1 ];     // Use the bind's World Space Y value as its bind height
        out.pos[ 0 ]   = v[ 0 ];            // Save Delta Change
        out.pos[ 1 ]   = v[ 1 ];
        out.pos[ 2 ]   = v[ 2 ];

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Alt Effector
        v .fromQuat( b.world.rot, lnk.effectorDir )
            .norm()
            .copyTo( out.effectorDir );

        // Alt Pole
        v .fromQuat( b.world.rot, lnk.poleDir )
            .norm()
            .copyTo( out.poleDir );
    }
}

export default HipSolver;