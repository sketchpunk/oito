import type { Pose }        from '@oito/armature/src';
import { Transform, Vec3 } from '@oito/core';
import type { TVec3 } from '@oito/type';
import type { BipedRig, IKChain, Link } from '..';
import IConstraint from './constraints/IConstraint';
import VerletSkeleton from './VerletSkeleton';

// https://github.com/sketchpunk/temp/blob/master/Fungi_v5_5/_test/armature/007_ikskeleton.html

class BipedFB{
    //#region MAIN
    rig         : BipedRig;
    skeleton    = new VerletSkeleton();

    poleArmL    = new Vec3();
    poleArmR    = new Vec3();
    poleLegL    = new Vec3();
    poleLegR    = new Vec3();

    _spineNames : string[] = [];
    _armLnames  = [ 'armL_head', 'armL_mid', 'armL_tail' ];
    _armRnames  = [ 'armR_head', 'armR_mid', 'armR_tail' ];
    _legLnames  = [ 'legL_head', 'legL_mid', 'legL_tail' ];
    _legRnames  = [ 'legR_head', 'legR_mid', 'legR_tail' ];

    constructor( rig: BipedRig ){
        this.rig = rig;
        this._build();
        this.skeleton.iterations = 5;
    }
    //#endregion

    _build(){
        const r = this.rig;
        const s = this.skeleton;
        let spineCnt = 0;

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // HIP
        s   .addPoint( "hip", { mass:1 } );
        s   .addPoint( "hip_eff", { mass:20 } );
        
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // SPINE
        if( r.spine ){
            // Create Main Point out of each bone's head position
            // Plus Two Extra Points to create an 'Axis Cage'
            let n: string;
            for( let lnk of r.spine.links ){
                n = 'spine' + lnk.idx;
                this._spineNames.push( n );
                s.addPoint( n, { mass:1 } );
                s.addPoint( n + '_eff', { mass:20 } );
                s.addPoint( n + '_pol', { mass:20, visible:false } );
            }

            // Link All the Spine Bones, Dont do the last bone
            let nn: string;
            for( let i=0; i < this._spineNames.length-1; i++ ){
                n   = this._spineNames[ i ];
                nn  = this._spineNames[ i+1 ];
                s.axisGroup( n, nn, n + '_eff', n + '_pol' );
            }
            
            // To handle the last bone, Need to create a point to handle
            // the spine's tail position.
            n = this._spineNames[ this._spineNames.length - 1 ];
            s.addPoint( 'spine_tail', { mass:1 } );
            s.axisGroup( n, 'spine_tail', n + '_eff', n + '_pol' );

            spineCnt = this._spineNames.length;
        }

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // ARMS
        s   .addPoint( this._armLnames[ 0 ], { mass:10 } )
            .addPoint( this._armLnames[ 1 ], { mass:30 } )
            .addPoint( this._armLnames[ 2 ], { mass:10 } )

        s   .addPoint( this._armRnames[ 0 ], { mass:10 } )
            .addPoint( this._armRnames[ 1 ], { mass:30 } )
            .addPoint( this._armRnames[ 2 ], { mass:10 } )

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // LEGS
        s   .addPoint( this._legLnames[ 0 ], { mass:10 } )
            .addPoint( this._legLnames[ 1 ], { mass:30 } )
            .addPoint( this._legLnames[ 2 ], { mass:10 } )

        s   .addPoint( this._legRnames[ 0 ], { mass:10 } )
            .addPoint( this._legRnames[ 1 ], { mass:30 } )
            .addPoint( this._legRnames[ 2 ], { mass:10 } )

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // CONSTRAINTS
        s   
            .triGroup( 'hip', [ 'hip', 'legL_head', 'legR_head' ])
            .segmentGroup( 'hipSpineH', this._spineNames[ 0 ], 'hip' )
            .segmentGroup( 'hipSpineL', this._spineNames[ 0 ], 'legL_head' )
            .segmentGroup( 'hipSpineR', this._spineNames[ 0 ], 'legR_head' )

            .segmentGroup( 'hipSpineEH', 'hip_eff', 'hip' )
            .segmentGroup( 'hipSpineEL', 'hip_eff', 'legL_head' )
            .segmentGroup( 'hipSpineER', 'hip_eff', 'legR_head' )
            .segmentGroup( 'hipSpineES', 'hip_eff', this._spineNames[ 0 ] )

            // .triGroup( 'chest', [ 'spine_tail', 'armL_head', 'armR_head' ])
            
            // .rangedSegmentGroup( 'spineA', 'spine_head', 'spine_chest' )

            .segmentGroup( 'chestRL', this._armLnames[ 0 ], this._armRnames[ 0 ] )

            .segmentGroup( 'chestLT', this._armLnames[ 0 ], 'spine_tail' )
            .segmentGroup( 'chestLH', this._armLnames[ 0 ], this._spineNames[ spineCnt-1 ] )
            .segmentGroup( 'chestLE', this._armLnames[ 0 ], this._spineNames[ spineCnt-1 ] + '_eff' )

            .segmentGroup( 'chestRT', this._armRnames[ 0 ], 'spine_tail' )
            .segmentGroup( 'chestRH', this._armRnames[ 0 ], this._spineNames[ spineCnt-1 ] )
            .segmentGroup( 'chestRE', this._armRnames[ 0 ], this._spineNames[ spineCnt-1 ] + '_eff' )
            
            

            // .segmentGroup( 'spineB', 'spine_chest', 'spine_tail' )
            // .segmentGroup( 'chestT', 'spine_chest', 'spine_tail' )
            // .segmentGroup( 'chestL', 'spine_chest', 'armL_head' )
            // .segmentGroup( 'chestR', 'spine_chest', 'armR_head' )

            .chainGroup( 'armL', this._armLnames )
            .chainGroup( 'armR', this._armRnames )
            .chainGroup( 'legL', this._legLnames )
            .chainGroup( 'legR', this._legRnames );
         
    }

    bindPose( pose: Pose, debug ?: any ): this{
        const r = this.rig;
        const s = this.skeleton;
        const v = new Vec3();
        let i   : number;
        let pos : TVec3;
        
        if( r.hip ){
            pos = r.hip.getStartPosition( pose );
            s.setPos( 'hip', pos );
            s.setPos( 'hip_eff', v.fromAdd( pos, [0,0,0.1] ) );
        }

        if( r.spine ){
            for( i=0; i < r.spine.count; i++ ){
                pos = pose.getBoneWorldPos( r.spine.links[ i ].idx );
                s.setPos( this._spineNames[ i ], pos );
                s.setPos( this._spineNames[ i ] + '_eff', v.fromAdd( pos, [0,0,0.1] ) );
                s.setPos( this._spineNames[ i ] + '_pol', v.fromAdd( pos, [0.1,0,0] ) );
            }

            this.skeleton.setPos( 'spine_tail', r.spine.getTailPosition( pose ) );
        }

        if( r.armL ) this._bindLimb( r.armL, pose, this._armLnames );
        if( r.armR ) this._bindLimb( r.armR, pose, this._armRnames );
        
        if( r.legL ) this._bindLimb( r.legL, pose, this._legLnames );
        if( r.legR ) this._bindLimb( r.legR, pose, this._legRnames );

        this.skeleton.rebindConstraints();
        return this;
    }

    _bindLimb( chain: IKChain, pose:Pose, names: string[] ): number[]{
        const pos = chain.getMiddlePosition( pose );
        this.skeleton.setPos( names[ 0 ], chain.getStartPosition( pose ) );
        this.skeleton.setPos( names[ 1 ], pos );
        this.skeleton.setPos( names[ 2 ], chain.getTailPosition( pose ) );
        return pos;
    }


    updateRigTargets(){
        const r = this.rig;
        const s = this.skeleton;
        let a: TVec3;
        let b: TVec3;
        let c: TVec3;

        const v0 = new Vec3();
        const v1 = new Vec3();
        const v2 = new Vec3();

        // ArmL
        a = s.getPoint( 'armL_head' )?.pos as TVec3;
        b = s.getPoint( 'armL_mid' )?.pos as TVec3;
        c = s.getPoint( 'armL_tail' )?.pos as TVec3;
        r.armL?.solver.setTargetPos( c );
        r.armL?.solver.setTargetPole( calcPole( a, b, c ) );

        // ArmR
        a = s.getPoint( 'armR_head' )?.pos as TVec3;
        b = s.getPoint( 'armR_mid' )?.pos as TVec3;
        c = s.getPoint( 'armR_tail' )?.pos as TVec3;
        r.armR?.solver.setTargetPos( c );
        r.armR?.solver.setTargetPole( calcPole( a, b, c ) );

        // LegL
        a = s.getPoint( 'legL_head' )?.pos as TVec3;
        b = s.getPoint( 'legL_mid' )?.pos as TVec3;
        c = s.getPoint( 'legL_tail' )?.pos as TVec3;
        r.legL?.solver.setTargetPos( c );
        r.legL?.solver.setTargetPole( calcPole( a, b, c ) );

        // LegR
        a = s.getPoint( 'legR_head' )?.pos as TVec3;
        b = s.getPoint( 'legR_mid' )?.pos as TVec3;
        c = s.getPoint( 'legR_tail' )?.pos as TVec3;
        r.legR?.solver.setTargetPos( c );
        r.legR?.solver.setTargetPole( calcPole( a, b, c ) );

        // Spine
        if( r.spine ){
            let n: string;
            let aEff : Array< TVec3 > = [];
            let aPol : Array< TVec3 > = [];

            for( let i=0; i < this._spineNames.length; i++ ){
                n = this._spineNames[ i ];
                a = s.getPoint( n )?.pos as TVec3;
                b = s.getPoint( n+ '_eff' )?.pos as TVec3;
                c = s.getPoint( n+ '_pol' )?.pos as TVec3;

                v0.fromSub( b, a );     // Fwd
                v1.fromSub( c, a );     // Left
                v2.fromCross( v0, v1 )  // up

                aEff.push( v2.norm().toArray() );
                aPol.push( v0.norm().toArray() );

                r.spine?.solver.setChainDir( aEff, aPol );
            }
        }

        // Hips
        a = s.getPoint( this._legLnames[ 0 ] )?.pos as TVec3;
        b = s.getPoint( this._legRnames[ 0 ] )?.pos as TVec3;
        v1.fromSub( a, b ); // Left

        a = s.getPoint( 'hip' )?.pos as TVec3;
        b = s.getPoint( 'hip_eff' )?.pos as TVec3;
        v0.fromSub( b, a ); // Fwd
        v2.fromCross( v0, v1 ); // Up

        r.hip?.solver
            .setTargetDir( v0.norm(), v2.norm() )
            .setMovePos( a, true );
    }
}

const V0 = new Vec3();
const V1 = new Vec3();
const V2 = new Vec3();

function calcPole( a:TVec3, b:TVec3, c:TVec3 ){
    V0.fromSub( c, a );     // Fwd
    V1.fromSub( b, a );     // Up
    V2.fromCross( V1, V0 ); // Lft
    return V1.fromCross( V0, V2 ).norm(); // up
}

export default BipedFB;