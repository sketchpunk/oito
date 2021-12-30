//#region IMPORTS
import type Armature    from '@oito/armature';

import { BoneMap, Pose }            from '@oito/armature';
import type { BoneChain, BoneInfo } from '@oito/armature/src/BoneMap';

import HipSolver        from '../solvers/HipSolver';
import LimbSolver       from '../solvers/LimbSolver';
import SwingTwistSolver from '../solvers/SwingTwistSolver';
import SwingTwistChainSolver from '../solvers/SwingTwistChainSolver';
import SwingTwistEndsSolver from '../solvers/SwingTwistEndsSolver';
//import NaturalCCDSolver from '../solvers/NaturalCCDSolver';

import { IKChain }      from './IKChain';
import IKRig            from './IKRig';

//#endregion

class BipedRig extends IKRig{
    //#region MAIN
    hip     ?: IKChain = undefined;
    spine   ?: IKChain = undefined;
    neck    ?: IKChain = undefined;
    head    ?: IKChain = undefined;
    armL    ?: IKChain = undefined;
    armR    ?: IKChain = undefined;
    legL    ?: IKChain = undefined;
    legR    ?: IKChain = undefined;
    handL   ?: IKChain = undefined;
    handR   ?: IKChain = undefined;
    footL   ?: IKChain = undefined;
    footR   ?: IKChain = undefined;

    constructor(){
        super();
    }
    //#endregion

    /** Try to find all the bones for each particular chains */
    autoRig( arm: Armature ): Boolean{
        const map           = new BoneMap( arm );   // Standard Bone Map, Easier to find bones using common names.
        let   isComplete    = true;                 // Are All the Parts of the AutoRigging found?
        let b               : BoneInfo | BoneChain | undefined;
        let bi              : BoneInfo;
        let n               : string;
        let names           : string[] = [];

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // VERY IMPORTANT : The order of the chains should not change in this
        // structure, it will determine the order in which the solvers will be
        // called. Certain chains should be called before others, like Hip Before Legs or Arms
        const chains = [
            { n:'hip',    ch:[ 'hip' ] },
            { n:'spine',  ch:[ 'spine' ] },
            { n:'legL',   ch:[ 'thigh_l', 'shin_l' ] },
            { n:'legR',   ch:[ 'thigh_r', 'shin_r' ] },
            { n:'armL',   ch:[ 'upperarm_l', 'forearm_l' ] },
            { n:'armR',   ch:[ 'upperarm_r', 'forearm_r' ] },
            { n:'neck',   ch:[ 'neck' ] },
            { n:'head',   ch:[ 'head' ] },
            { n:'handL',  ch:[ 'hand_l' ] },
            { n:'handR',  ch:[ 'hand_r' ] },
            { n:'footL',  ch:[ 'foot_l' ] },
            { n:'footR',  ch:[ 'foot_r' ] },
        ];

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        for( let itm of chains ){
            n               = itm.n;    // Name of Chain
            names.length    = 0;        // Reset Bone Name Array

            //=============================================
            // Find all bone names assigned to this chain.
            for( let i=0; i < itm.ch.length; i++ ){
                b = map.bones.get( itm.ch[ i ] );  // Get Find Bone Reference

                //-------------------------------
                // Not Found, Exit loop to work on next chain.
                if( !b ){
                    console.log( 'AutoRig - Missing ',  itm.ch[ i ] );
                    isComplete = false;
                    break;
                }

                //-------------------------------
                if( b instanceof BoneMap.BoneInfo )         names.push( b.name );
                else if( b instanceof BoneMap.BoneChain )   for( bi of b.items ) names.push( bi.name );
            }

            //=============================================
            this[ n ] = this.add( arm, n, names );              // Add Chain to Rig & assign chain to Rig's property of the same name.
        }

        this._setAltDirection( arm );

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        return isComplete;
    }

    /** Use Solver Configuration for Retargeting Animation */
    useSolversForRetarget( pose ?: Pose ): this{
        this.hip?.setSolver( new HipSolver().initData( pose, this.hip ) );
        this.head?.setSolver( new SwingTwistSolver().initData( pose, this.head ) );
        this.armL?.setSolver( new LimbSolver().initData( pose, this.armL ) );
        this.armR?.setSolver( new LimbSolver().initData( pose, this.armR ) );
        this.legL?.setSolver( new LimbSolver().initData( pose, this.legL ) );
        this.legR?.setSolver( new LimbSolver().initData( pose, this.legR ) );
        this.footL?.setSolver( new SwingTwistSolver().initData( pose, this.footL ) );
        this.footR?.setSolver( new SwingTwistSolver().initData( pose, this.footR ) );
        this.handL?.setSolver( new SwingTwistSolver().initData( pose, this.handL ) );
        this.handR?.setSolver( new SwingTwistSolver().initData( pose, this.handR ) );

        this.spine?.setSolver( new SwingTwistEndsSolver().initData( pose, this.spine ) );
        //this.spine?.setSolver( new NaturalCCDSolver().useArcSqrFactor( 0.05, 0.2, false ).initData( pose, this.spine ).setTries( 30 ) );
        //this.spine?.setSolver( new SwingTwistChainSolver().initData( pose, this.spine ) );

        return this;
    }

    /** Use Solver Configuration for Fullbody IK */
    useSolversForFBIK( pose ?: Pose ): this{
        this.hip?.setSolver( new HipSolver().initData( pose, this.hip ) );
        this.head?.setSolver( new SwingTwistSolver().initData( pose, this.head ) );
        this.armL?.setSolver( new LimbSolver().initData( pose, this.armL ) );
        this.armR?.setSolver( new LimbSolver().initData( pose, this.armR ) );
        this.legL?.setSolver( new LimbSolver().initData( pose, this.legL ) );
        this.legR?.setSolver( new LimbSolver().initData( pose, this.legR ) );
        this.footL?.setSolver( new SwingTwistSolver().initData( pose, this.footL ) );
        this.footR?.setSolver( new SwingTwistSolver().initData( pose, this.footR ) );
        this.handL?.setSolver( new SwingTwistSolver().initData( pose, this.handL ) );
        this.handR?.setSolver( new SwingTwistSolver().initData( pose, this.handR ) );

        this.spine?.setSolver( new SwingTwistChainSolver().initData( pose, this.spine ) );
        return this;
    }

    /** Setup Chain Data & Sets Alt Directions */
    bindPose( pose: Pose ): this{
        super.bindPose( pose );
        this._setAltDirection( pose );
        return this;
    }

    _setAltDirection( pose: any ): void{
        const FWD = [0,0,1];
        const UP  = [0,1,0];
        const DN  = [0,-1,0];
        const R   = [-1,0,0];
        const L   = [1,0,0];
        const BAK = [0,0,-1];

        if( this.hip )      this.hip.bindAltDirections( pose, FWD, UP );
        if( this.spine )    this.spine.bindAltDirections( pose, UP, FWD );
        if( this.neck )     this.neck.bindAltDirections( pose, FWD, UP );
        if( this.head )     this.head.bindAltDirections( pose, FWD, UP );
        
        if( this.legL )     this.legL.bindAltDirections( pose, DN, FWD );
        if( this.legR )     this.legR.bindAltDirections( pose, DN, FWD );
        if( this.footL )    this.footL.bindAltDirections( pose, FWD, UP );
        if( this.footR )    this.footR.bindAltDirections( pose, FWD, UP );

        if( this.armL )     this.armL.bindAltDirections( pose, L, BAK );
        if( this.armR )     this.armR.bindAltDirections( pose, R, BAK );
        if( this.handL )    this.handL.bindAltDirections( pose, L, BAK );
        if( this.handR )    this.handR.bindAltDirections( pose, R, BAK );
    }

    resolveToPose( pose: any, debug ?: any ){
        let ch: IKChain;
        //console.time( 'resolveToPose' );
        for( ch of this.items.values() ){
            if( ch.solver ) ch.resolveToPose( pose, debug );
        }
        //console.timeEnd( 'resolveToPose' );
    }
}

export default BipedRig;