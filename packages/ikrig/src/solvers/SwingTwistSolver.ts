//#region IMPORTS
import type { TVec3 }               from '@oito/type';
import type { Pose }                from '@oito/armature';
import type { IKChain }             from '../rigs/IKChain';
import type { ISolver }             from './ISolver';
import type { IKData }              from '..';

import { Vec3, Transform, Quat }    from '@oito/core';
//#endregion

class SwingTwistSolver implements ISolver{
    //#region TARGETTING DATA
    _isTarPosition  = false;        // Is the Target a Position or a Direction?
    _originPoleDir  = [ 0, 0, 0 ];  // Pole gets updated based on effector direction, so keep originally set dir to compute the orthogonal poleDir
    effectorScale   = 1;
    effectorPos     = [ 0, 0, 0 ];  // IK Target can be a Position or...
    effectorDir     = [ 0, 0, 1 ];  // Direction. BUT if its position, need to compute dir from chain origin position.
    poleDir         = [ 0, 1, 0 ];  // Direction that handles the twisitng rotation
    orthoDir        = [ 1, 0, 0 ];  // Direction that handles the bending direction, like elbow/knees.
    originPos       = [ 0, 0, 0 ];  // Starting World Position of the Chain

    //#endregion

    initData( pose?: Pose, chain?: IKChain ): this{
        if( pose && chain ){
            // If init pose is the same used for binding, this should recreate the WORLD SPACE Pole Direction just fine
            const lnk   = chain.links[ 0 ];
            const pole  = new Vec3( lnk.poleDir );
            const eff   = new Vec3( lnk.effectorDir );
            const rot   = pose.bones[ lnk.idx ].world.rot;

            rot.transformVec3( eff );
            rot.transformVec3( pole ); 

            this.setTargetDir( eff, pole );
            //this.setTargetPos( chain.getTailPosition( pose ), pole );
        }
        return this;
    }

    //#region SETTING TARGET DATA
    setTargetDir( e: TVec3, pole ?: TVec3, effectorScale ?: number ): this{
        this._isTarPosition     = false;
        this.effectorDir[ 0 ]   = e[ 0 ];
        this.effectorDir[ 1 ]   = e[ 1 ];
        this.effectorDir[ 2 ]   = e[ 2 ];
        if( pole ) this.setTargetPole( pole );

        if( effectorScale ) this.effectorScale = effectorScale;
        return this;
    }

    setTargetPos( v: TVec3, pole ?: TVec3 ): this{
        this._isTarPosition     = true;
        this.effectorPos[ 0 ]   = v[ 0 ];
        this.effectorPos[ 1 ]   = v[ 1 ];
        this.effectorPos[ 2 ]   = v[ 2 ];
        if( pole ) this.setTargetPole( pole );
        return this;
    }

    setTargetPole( v: TVec3 ): this{
        this._originPoleDir[ 0 ] = v[ 0 ];
        this._originPoleDir[ 1 ] = v[ 1 ];
        this._originPoleDir[ 2 ] = v[ 2 ];
        return this;
    }
    //#endregion

    resolve( chain: IKChain, pose: Pose, debug?:any ): void{
        const [ rot, pt ] = this.getWorldRot( chain, pose, debug );

        rot.pmulInvert( pt.rot );                       // To Local Space
        pose.setLocalRot( chain.links[ 0 ].idx, rot );  // Save to Pose
    }

    ikDataFromPose( chain: IKChain, pose: Pose, out: IKData.Dir ): void{
        const dir = new Vec3();
        const lnk = chain.first();
        const b   = pose.bones[ lnk.idx ];

        // Alt Effector
        dir .fromQuat( b.world.rot, lnk.effectorDir )
            .norm()
            .copyTo( out.effectorDir );

        // Alt Pole
        dir .fromQuat( b.world.rot, lnk.poleDir )
            .norm()
            .copyTo( out.poleDir );
    }


    /** Update Target Data  */
    _update( origin: TVec3 ): void{
        const v = new Vec3();
        const o = [0,0,0];

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Compute the Effector Direction if only given effector position
        if( this._isTarPosition ) v.fromSub( this.effectorPos, origin ).norm().copyTo( this.effectorDir ); // Forward Axis Z

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        v.fromCross( this._originPoleDir, this.effectorDir ).norm().copyTo( this.orthoDir );    // Left axis X - Only needed to make pole orthogonal to effector
        v.fromCross( this.effectorDir, this.orthoDir ).norm().copyTo( this.poleDir );           // Up Axis Y - 

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        this.originPos[ 0 ] = origin[ 0 ];
        this.originPos[ 1 ] = origin[ 1 ];
        this.originPos[ 2 ] = origin[ 2 ];
    }

    getWorldRot( chain: IKChain, pose: Pose, debug?:any ) : [ Quat, Transform ]{
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        const pt    = new Transform();
        const ct    = new Transform();
        
        let lnk     = chain.first();

        // Get the Starting Transform
        if( lnk.pidx == -1 )    pt.copy( pose.offset );
        else                    pose.getWorldTransform( lnk.pidx, pt );

        ct.fromMul( pt, lnk.bind );     // Get Bone's BindPose position in relation to this pose
        this._update( ct.pos );         // Update Data to use new Origin.

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        const rot = new Quat( ct.rot );
        const dir = new Vec3();
        const q   = new Quat();

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Swing
        dir.fromQuat( ct.rot, lnk.effectorDir );    // Get WS Binding Effector Direction of the Bone
        q.fromUnitVecs( dir, this.effectorDir );    // Rotation TO IK Effector Direction
        rot.pmul( q );                              // Apply to Bone WS Rot

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Twist
        dir.fromQuat( rot, lnk.poleDir );           // Get WS Binding Pole Direction of the Bone
        q.fromUnitVecs( dir, this.poleDir );        // Rotation to IK Pole Direction
        rot.pmul( q );                              // Apply to Bone WS Rot + Swing

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Kinda Hacky putting this here, but its the only time where there is access to chain's length for all extending solvers.
        // So if not using a TargetPosition, means we're using Direction then we have to compute the effectorPos.
        if( !this._isTarPosition ){
            this.effectorPos[ 0 ] = this.originPos[ 0 ] + this.effectorDir[ 0 ] * chain.length * this.effectorScale;
            this.effectorPos[ 1 ] = this.originPos[ 1 ] + this.effectorDir[ 1 ] * chain.length * this.effectorScale;
            this.effectorPos[ 2 ] = this.originPos[ 2 ] + this.effectorDir[ 2 ] * chain.length * this.effectorScale;
        }

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        return [ rot, pt ];
    }

}

export default SwingTwistSolver;