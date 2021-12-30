//#region IMPORTS
import type { Pose }        from '@oito/armature/src';
import type { TVec3 }       from '@oito/type';

import type { BipedRig, IKChain, Link } from '..';
import type { IVerletPointConfig }      from './types';

import type P4Cage          from './verlet/cages/P4Cage';
import type AxisCage        from './verlet/cages/AxisCage';
import type VerletPoint     from './verlet/VerletPoint';
import type LimbCage        from './verlet/cages/LimbCage';
import type TriExtCage      from './verlet/cages/TriExtCage';

import VerletSkeleton       from './verlet/VerletSkeleton';
import RenderLine           from './RenderLine';

//import { Vec3 }             from '@oito/core';
//#endregion

//#region CONFIG
// Trying for a 33% / 77% spit in Mass
const Spine_Mass = 8;
const Biped_Config : { [key:string]:IVerletPointConfig } = {
    hip         : { mass: 16 },
    head        : { mass: 1 },
    armL_head   : { mass: 4 }, 
    armL_pole   : { mass: 2, pole: true },
    armL_tail   : { mass: 1 },
    armR_head   : { mass: 4 },
    armR_pole   : { mass: 2, pole: true },
    armR_tail   : { mass: 1 },
    legL_head   : { mass: 4 },
    legL_pole   : { mass: 2, pole: true },
    legL_tail   : { mass: 1 },
    legR_head   : { mass: 4 },
    legR_pole   : { mass: 2, pole: true },
    legR_tail   : { mass: 1 },
};
//#endregion

class BipedFBIK{
    //#region MAIN
    skeleton    = new VerletSkeleton();
    rig         : BipedRig;
    lines       : Array<RenderLine> = [];

    hipCage     !: P4Cage;
    chestCage   !: P4Cage;
    armL        !: LimbCage;
    armR        !: LimbCage;
    legL        !: LimbCage;
    legR        !: LimbCage;

    footL       !: TriExtCage;
    footR       !: TriExtCage;
    handL       !: TriExtCage;
    handR       !: TriExtCage;

    spineCage   : Array< AxisCage >    = [];
    spinePnts   : Array< VerletPoint > = [];
    hip         !: VerletPoint;
    head        !: TriExtCage;

    constructor( rig: BipedRig ){
        this.rig = rig;
        this._build();              // Build Points + Constraints
        this._defineRenderLines();  // Create lines for Renderer

        this.skeleton.iterations = 10;
    }
    //#endregion

    //#region PRIVATE METHODS
    _build(): void{
        const s = this.skeleton;
        const r = this.rig;
        const t : any = {};         // Hold Verlet Points Temporarily before placing into cage 
        
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        let k: string, i: IVerletPointConfig;
        for( k in Biped_Config ){
            t[ k ] = s.newPoint( Biped_Config[ k ] );
        }

        this.hip    = t.hip;
        
        this.armL   = s.newLimbCage( t.armL_head, t.armL_pole, t.armL_tail ).setPrevPole( [0,0,-1] );
        this.armR   = s.newLimbCage( t.armR_head, t.armR_pole, t.armR_tail ).setPrevPole( [0,0,-1] );
        this.legR   = s.newLimbCage( t.legR_head, t.legR_pole, t.legR_tail ).setPrevPole( [0,0,1] );
        this.legL   = s.newLimbCage( t.legL_head, t.legL_pole, t.legL_tail ).setPrevPole( [0,0,1] );

        this.footL  = s.newTriExtCage( t.legL_tail, true );
        this.footR  = s.newTriExtCage( t.legR_tail, true );

        this.handL  = s.newTriExtCage( t.armL_tail, false );
        this.handR  = s.newTriExtCage( t.armR_tail, false );

        this.head   = s.newTriExtCage( t.head, false );

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        if( r.spine ){
            // Spine Bones
            for( let lnk of r.spine.links ){
                this.spinePnts.push( s.newPoint( { mass:Spine_Mass } ) );
            }

            // Spine Tail
            this.spinePnts.push( s.newPoint( { mass:Spine_Mass } ) );
            
            // Create a Constraint Cage
            this.hipCage    = s.newP4Cage( this.hip, this.spinePnts[ 0 ], t.legR_head, t.legL_head );
            this.chestCage  = s.newP4Cage( this.spinePnts[ r.spine.count-1 ], this.spinePnts[ r.spine.count ], t.armR_head, t.armL_head );

            for( let i=0; i < r.spine.count - 1; i++ ){
                this.spineCage.push( s.newAxisCage( this.spinePnts[ i ], this.spinePnts[ i+1 ] ) );
            }

            s.newLink( this.chestCage.pTail, this.head.pHead );
        }
    }

    _defineRenderLines(): void{
        this.lines.push(
            new RenderLine( this.head.pHead.pos, this.head.pPole.pos ),
            new RenderLine( this.head.pHead.pos, this.head.pEff.pos ),
            new RenderLine( this.head.pPole.pos, this.head.pEff.pos ),

            new RenderLine( this.head.pHead.pos, this.head.pPole.pos ),
            new RenderLine( this.head.pHead.pos, this.chestCage.pTail.pos ),
            new RenderLine( this.chestCage.pTail.pos, this.chestCage.pHead.pos ),
            new RenderLine( this.chestCage.pHead.pos, this.chestCage.pPole.pos ),

            new RenderLine( this.chestCage.pTail.pos, this.armL.pHead.pos ),
            new RenderLine( this.armL.pHead.pos, this.armL.pPole.pos ),
            new RenderLine( this.armL.pPole.pos, this.armL.pTail.pos ),
            new RenderLine( this.armL.pTail.pos, this.handL.pEff.pos ),
            new RenderLine( this.armL.pTail.pos, this.handL.pPole.pos ),
            new RenderLine( this.handL.pEff.pos, this.handL.pPole.pos ),

            new RenderLine( this.chestCage.pTail.pos, this.armR.pHead.pos ),
            new RenderLine( this.armR.pHead.pos, this.armR.pPole.pos ),
            new RenderLine( this.armR.pPole.pos, this.armR.pTail.pos ),
            new RenderLine( this.armR.pTail.pos, this.handR.pEff.pos ),
            new RenderLine( this.armR.pTail.pos, this.handR.pPole.pos ),
            new RenderLine( this.handR.pEff.pos, this.handR.pPole.pos ),

            new RenderLine( this.legL.pHead.pos, this.legL.pPole.pos ),
            new RenderLine( this.legL.pPole.pos, this.legL.pTail.pos ),
            new RenderLine( this.legL.pTail.pos, this.footL.pEff.pos ),
            new RenderLine( this.legL.pTail.pos, this.footL.pPole.pos ),
            new RenderLine( this.footL.pEff.pos, this.footL.pPole.pos ),

            new RenderLine( this.legR.pHead.pos, this.legR.pPole.pos ),
            new RenderLine( this.legR.pPole.pos, this.legR.pTail.pos ),
            new RenderLine( this.legR.pTail.pos, this.footR.pEff.pos ),
            new RenderLine( this.legR.pTail.pos, this.footR.pPole.pos ),
            new RenderLine( this.footR.pEff.pos, this.footR.pPole.pos ),

            new RenderLine( this.hipCage.pHead.pos, this.hipCage.pLeft.pos ),
            new RenderLine( this.hipCage.pHead.pos, this.hipCage.pRight.pos ),
            new RenderLine( this.hipCage.pHead.pos, this.hipCage.pPole.pos ),
            new RenderLine( this.hipCage.pHead.pos, this.hipCage.pTail.pos ),
        );

        for( let c of this.spineCage ){
            this.lines.push( new RenderLine( c.pHead.pos, c.pTail.pos ) );
            this.lines.push( new RenderLine( c.pHead.pos, c.pPole.pos ) );
        }
    }
    //#endregion

    //#region BIND INITIAL POSITION
    bindPose( pose: Pose, resetConstraints:false, debug ?: any ): this{
        const r = this.rig;
        let p1: TVec3;
        let p2: TVec3;

        if( r.hip ){
            this.hip.setPos( r.hip.getStartPosition( pose ) );
            this.hipCage.updatePole();
        }

        if( r.head ){
            p1 = r.head.getStartPosition( pose );
            p2 = r.head.getTailPosition( pose )
            this.head.pHead.setPos( p1 );
            this.head.setPoleOffset( p1, [0,0,0.2], [0,p2[1]-p1[1],0] );
        }

        if( r.spine ){
            // Spine Bones
            let lnk: Link;
            for( let i=0; i < r.spine.count; i++ ){
                this.spinePnts[ i ].setPos( r.spine.getPositionAt( pose, i ) );
            }

            // Spine Tail
            this.spinePnts[ r.spine.count ].setPos( r.spine.getTailPosition( pose ) );
            this.chestCage.updatePole();
            
            for( let i of this.spineCage ) i.updatePole();
        }

        if( r.legR ) this._bindLimb( r.legR, pose, this.legR );
        if( r.legL ) this._bindLimb( r.legL, pose, this.legL );
        if( r.armR ) this._bindLimb( r.armR, pose, this.armR );
        if( r.armL ) this._bindLimb( r.armL, pose, this.armL );

        if( r.footL ){
            p1 = this.legL.pTail.pos;
            p2 = r.footL.getTailPosition( pose );
            this.footL.setPoleOffset( p1, [0,0,p2[2]-p1[2]], [0,p2[1]-p1[1],0] );
        }

        if( r.footR ){
            p1 = this.legR.pTail.pos;
            p2 = r.footR.getTailPosition( pose );
            this.footR.setPoleOffset( p1, [0,0,p2[2]-p1[2]], [0,p2[1]-p1[1],0] );
        }

        if( r.handL ){
            p1 = this.armL.pTail.pos;
            p2 = r.handL.getTailPosition( pose );
            this.handL.setPoleOffset( p1, [p2[0]-p1[0],0,0], [0,0,-0.1] );
        }

        if( r.handR ){
            p1 = this.armR.pTail.pos;
            p2 = r.handR.getTailPosition( pose );
            this.handR.setPoleOffset( p1, [p2[0]-p1[0],0,0], [0,0,-0.1] );
        }

        if( resetConstraints ) this.skeleton.rebindConstraints();
        return this;
    }

    _bindLimb( chain: IKChain, pose:Pose, limb: LimbCage ): void{
        limb.pHead.setPos( chain.getStartPosition( pose ) );
        limb.pPole.setPos( chain.getMiddlePosition( pose ) );
        limb.pTail.setPos( chain.getTailPosition( pose ) );
    }
    //#endregion

    setPointPos( idx: number, pos: TVec3 ): this{
        this.skeleton.setPos( idx, pos );
        return this;
    }

    resolve(): this{
        this.skeleton.resolve();
        return this;
    }

    resolveForPole( pIdx: number ): this{
        let cage: any;
        let cage2: any;

        if( this.armL.pPole.idx == pIdx ){
            cage    = this.armL;
            cage2   = this.handL;
        }else if( this.armR.pPole.idx == pIdx ){
            cage    = this.armR;
            cage2   = this.handR;

        }else if( this.chestCage.pPole.idx == pIdx ) cage = this.chestCage;
        else if( this.hipCage.pPole.idx == pIdx )   cage = this.hipCage;

        else if( this.legR.pPole.idx == pIdx ){
            cage    = this.legR;
            cage2   = this.footR;
        
        }else if( this.legL.pPole.idx == pIdx ){
            cage    = this.legL;
            cage2   = this.footL;
        }

        else if( this.head.pPole.idx == pIdx || this.head.pEff.idx == pIdx ) cage = this.head;

        else if( this.footL.pPole.idx == pIdx || this.footL.pEff.idx == pIdx ) cage = this.footL;
        else if( this.footR.pPole.idx == pIdx || this.footR.pEff.idx == pIdx ) cage = this.footR;

        else if( this.handL.pPole.idx == pIdx || this.handL.pEff.idx == pIdx ) cage = this.handL;
        else if( this.handR.pPole.idx == pIdx || this.handR.pEff.idx == pIdx ) cage = this.handR;

        else{
            for( let c of this.spineCage ){
                if( c.pPole.idx == pIdx ){ cage = c; break; }
            }
        }

        if( !cage ){
            console.warn( 'Can not found Verlet Cage that pole belongs to:', pIdx );
            return this;
        }

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        let isDone = false;
        let i      = 0;

        cage.poleMode( true );
        
        do{
            isDone = true;
            if( !cage.resolve() )           isDone = false; // Run Cage
            if( cage2 && !cage2.resolve() ) isDone = false; // Run Second Cage

            i++;
        }while( !isDone && i < this.skeleton.iterations )

        cage.poleMode( false );

        return this;
    }

    updateRigTargets(){
        const r               = this.rig;
        const effDir  : TVec3 = [0,0,0];
        const poleDir : TVec3 = [0,0,0];

        // HIPS
        this.hipCage.getAxis( effDir, poleDir );
        r.hip?.solver
            .setTargetDir( effDir, poleDir )
            .setMovePos( this.hipCage.getHeadPos(), true );

        // HEAD
        this.head.getAxis( effDir, poleDir );
        r.head?.solver
            .setTargetDir( effDir, poleDir );


        // ARMS
        r.armL?.solver
            .setTargetPos( this.armL.getTailPos() )
            .setTargetPole( this.armL.getPoleDir( poleDir ) );

        r.armR?.solver
            .setTargetPos( this.armR.getTailPos() )
            .setTargetPole( this.armR.getPoleDir( poleDir ) );

        this.handL.getAxis( effDir, poleDir );
        r.handL?.solver
            .setTargetDir( effDir, poleDir );

        this.handR.getAxis( effDir, poleDir );
        r.handR?.solver
            .setTargetDir( effDir, poleDir );


        // LEGS
        r.legL?.solver
            .setTargetPos( this.legL.getTailPos() )
            .setTargetPole( this.legL.getPoleDir( poleDir ) );

        r.legR?.solver
            .setTargetPos( this.legR.getTailPos() )
            .setTargetPole( this.legR.getPoleDir( poleDir ) );

        this.footL.getAxis( effDir, poleDir );
        r.footL?.solver
            .setTargetDir( effDir, poleDir );

        this.footR.getAxis( effDir, poleDir );
        r.footR?.solver
            .setTargetDir( effDir, poleDir );


        // SPINE
        if( r.spine ){
            const aEff : Array< TVec3 > = [];
            const aPol : Array< TVec3 > = [];

            for( let i=0; i < this.spineCage.length; i++ ){
                this.spineCage[ i ]
                    .getAxis( poleDir, effDir );    // Spine has Pole+Eff flipped

                aEff.push( effDir.slice( 0 ) );
                aPol.push( poleDir.slice( 0 ) );
            }

            this.chestCage.getAxis( poleDir, effDir );
            aEff.push( effDir.slice( 0 ) );
            aPol.push( poleDir.slice( 0 ) );

            r.spine.solver.setChainDir( aEff, aPol );
        }
    }
}


export default BipedFBIK;