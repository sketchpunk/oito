//#region IMPORTS
import type { TVec3 }               from '@oito/type';
import type { Pose }                from '@oito/armature';
import type { IKChain, Link }       from '../rigs/IKChain';
import type { ISolver }             from './ISolver';

import { Vec3, Transform, Quat }    from '@oito/core';
//#endregion

class SwingTwistEndsSolver implements ISolver{
    //#region TARGETTING DATA

    startEffectorDir    = [ 0, 0, 0 ];
    startPoleDir        = [ 0, 0, 0 ];
    endEffectorDir      = [ 0, 0, 0 ];
    endPoleDir          = [ 0, 0, 0 ];
    /*
    _isTarPosition  = false;        // Is the Target a Position or a Direction?
    _originPoleDir  = [ 0, 0, 0 ];
    effectorPos     = [ 0, 0, 0 ];  // IK Target can be a Position or...
    effectorDir     = [ 0, 0, 1 ];  // Direction. BUT if its position, need to compute dir from chain origin position.
    poleDir         = [ 0, 1, 0 ];  // Direction that handles the twisitng rotation
    orthoDir        = [ 1, 0, 0 ];  // Direction that handles the bending direction, like elbow/knees.
    originPos       = [ 0, 0, 0 ];  // Starting World Position of the Chain
    */
    //#endregion

    initData( pose?: Pose, chain?: IKChain ): this{
        if( pose && chain ){
            //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            const pole  = new Vec3();
            const eff   = new Vec3();
            let rot     : Quat;
            let lnk     : Link;

            //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            // First Direction
            lnk = chain.first();
            rot = pose.bones[ lnk.idx ].world.rot;
            pole.fromQuat( rot, lnk.poleDir );
            eff.fromQuat( rot, lnk.effectorDir );
            this.setStartDir( eff, pole );
            
            //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            // Second Direction
            lnk = chain.last();
            rot = pose.bones[ lnk.idx ].world.rot;
            pole.fromQuat( rot, lnk.poleDir );
            eff.fromQuat( rot, lnk.effectorDir );
            this.setEndDir( eff, pole );
        }
        return this;
    }

    //#region SETTING TARGET DATA
    setStartDir( eff: TVec3, pole: TVec3 ): this{
        this.startEffectorDir[ 0 ]  = eff[ 0 ];
        this.startEffectorDir[ 1 ]  = eff[ 1 ];
        this.startEffectorDir[ 2 ]  = eff[ 2 ];
        this.startPoleDir[ 0 ]      = pole[ 0 ];
        this.startPoleDir[ 1 ]      = pole[ 1 ];
        this.startPoleDir[ 2 ]      = pole[ 2 ];
        return this;
    }

    setEndDir( eff: TVec3, pole: TVec3 ): this{
        this.endEffectorDir[ 0 ]  = eff[ 0 ];
        this.endEffectorDir[ 1 ]  = eff[ 1 ];
        this.endEffectorDir[ 2 ]  = eff[ 2 ];
        this.endPoleDir[ 0 ]      = pole[ 0 ];
        this.endPoleDir[ 1 ]      = pole[ 1 ];
        this.endPoleDir[ 2 ]      = pole[ 2 ];
        return this;
    }
    //#endregion

    resolve( chain: IKChain, pose: Pose, debug?:any ): void{
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        const iEnd      = chain.count - 1;
        const pRot      = new Quat();
        const cRot      = new Quat();
        const ikEffe    = new Vec3();
        const ikPole    = new Vec3();
        const dir       = new Vec3();
        const rot       = new Quat();
        const tmp       = [ 0, 0, 0, 1 ];

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        let lnk: Link   = chain.first();
        let t  : number;

        // Get Starting Parent WS Rotation
        if( lnk.pidx != -1 )    pose.getWorldRotation( lnk.pidx, pRot );
        else                    pRot.copy( pose.offset.rot );

        /* DEBUG
        const v         = new Vec3();
        const pTran     = new Transform();
        const cTran     = new Transform();
        pose.getWorldTransform( lnk.pidx, pTran );
        */

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        for( let i=0; i <= iEnd; i++ ){
            //-----------------------
            // PREPARE
            t   = i / iEnd;         // Lerp Value
            lnk = chain.links[ i ]; // Which Bone to act on
            ikEffe.fromLerp( this.startEffectorDir, this.endEffectorDir, t );   // Get Current Effector Direction
            ikPole.fromLerp( this.startPoleDir, this.endPoleDir, t );           // Get Current Pole Direction

            //-----------------------
            // SWING
            cRot.fromMul( pRot, lnk.bind.rot );         // Get bone in WS that has yet to have any rotation applied
            dir.fromQuat( cRot, lnk.effectorDir );      // What is the WS Effector Direction
            rot.fromUnitVecs( dir, ikEffe );            // Create our Swing Rotation
            cRot.pmul( rot );                           // Then Apply to our Bone, so its now swong to match the ik effector dir

            /* DEBUG
            cTran.fromMul( pTran, lnk.bind );
            debug.pnt.add( cTran.pos, 0x00ff00, 1 );
            debug.ln.add( cTran.pos, v.fromScale( dir, 0.1 ).add( cTran.pos ), 0x00ff00 );
            */

			//-----------------------
            // TWIST
			dir.fromQuat( cRot, lnk.poleDir );          // Get our Current Pole Direction from Our Effector Rotation
			rot.fromUnitVecs( dir, ikPole );            // Create our twist rotation
			cRot.pmul( rot );                           // Apply Twist so now it matches our IK Pole direction
            cRot.copyTo( tmp );                         // Save as the next Parent Rotation

            /* DEBUG
            debug.ln.add( cTran.pos, v.fromScale( dir, 0.2 ).add( cTran.pos ), 0x00ff00 );
            debug.ln.add( cTran.pos, v.fromScale( ikPole, 0.2 ).add( cTran.pos ), 0xff0000 );
            */

			//-----------------------
			cRot.pmulInvert( pRot );                    // To Local Space
			pose.setLocalRot( lnk.idx, cRot );          // Save back to pose
			if( i != iEnd ) pRot.copy( tmp );           // Set WS Rotation for Next Bone.

            /* DEBUG
            pTran.mul( cRot, lnk.bind.pos, lnk.bind.scl );
            */
        }
    }

    /*
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

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        return [ rot, pt ];
    }
    */
}

export default SwingTwistEndsSolver;