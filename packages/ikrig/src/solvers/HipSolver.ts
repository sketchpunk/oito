//#region IMPORTS
import type { TVec3 }               from "@oito/type";
import type { Pose }                from "@oito/armature";
import type { IKChain }             from "../rigs/IKChain";

import { Vec3, Transform, Quat }    from "@oito/core";
import SwingTwistSolver             from "./SwingTwistSolver";
//#endregion

class HipSolver{
    //#region MAIN
    isAbs       = true;
    position    = [ 0, 0, 0 ];
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

    setMovePos( pos: TVec3, isAbs=true ): this{
        this.position[ 0 ]  = pos[ 0 ];
        this.position[ 1 ]  = pos[ 1 ];
        this.position[ 2 ]  = pos[ 2 ];
        this.isAbs          = isAbs;
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
            
            //debug.pnt.add( ct.pos, 0x00ffff, 1 );
            hipPos.fromAdd( ct.pos, this.position );    // Add Offset Position

        }

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        ptInv.transformVec3( hipPos );                  // To Local Space
        pose.setLocalPos( lnk.idx, hipPos );

        this._swingTwist.resolve( chain, pose, debug ); // Apply SwingTwist Rotation
    }
}

export default HipSolver;