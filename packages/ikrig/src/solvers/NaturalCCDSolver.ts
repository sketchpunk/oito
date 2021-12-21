//#region IMPORTS
import type { TVec3 }               from '@oito/type';
import type { Pose }                from '@oito/armature';
import type { IKChain, Link }             from '../rigs/IKChain';

import { Vec3, Transform, Quat }    from '@oito/core';
import { ISolver }                  from './ISolver';
//#endregion


class NaturalCCDSolver implements ISolver{
    //#region TARGETTING DATA
    effectorPos  = [ 0, 0, 0 ];
    _minEffRng   = 0.001**2;    // Min Effector Range Square
    _chainCnt    = 0;
    _local      !: Transform[];
    _world      !: Transform[];
    _kFactor    !: any;
    _tries      = 30;
    //#endregion

    initData( pose?: Pose, chain?: IKChain ): this{
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Get the Chain's Tail Position as the Effector Position
        if( pose && chain ){
            const lnk = chain.last();
            const eff = new Vec3( 0, lnk.len, 0 );

            pose.bones[ lnk.idx ].world.transformVec3( eff ); // The Trail Position in WorldSpace
            eff.copyTo( this.effectorPos );
        }

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Setup Transform Chains to handle Iterative Processing of CCD
        if( chain ){
            const cnt       = chain.count;
            this._chainCnt  = cnt; 
            this._world     = new Array( cnt + 1 ); // Extra Transform for Final Tail
            this._local     = new Array( cnt + 1 );

            // Create a Transform for each link/bone
            for( let i=0; i < cnt; i++ ){
                this._world[ i ] = new Transform();
                this._local[ i ] = new Transform();
            }

            // Tail Transform
            this._world[ cnt ]  = new Transform();
            this._local[ cnt ]  = new Transform( [0,0,0,1], [0,chain.last().len,0], [1,1,1] ); 
        }

        return this;
    }

    //#region SETTING TARGET DATA
    setTargetPos( v: TVec3 ): this{ 
        this.effectorPos[ 0 ] = v[ 0 ];
        this.effectorPos[ 1 ] = v[ 1 ];
        this.effectorPos[ 2 ] = v[ 2 ];
        return this;
    }

    useArcSqrFactor( c: number, offset: number, useInv = false ): this{
        this._kFactor = new KFactorArcSqr( c, offset, useInv );
        return this
    }

    setTries( v: number ){ this._tries = v; return this; }
    //#endregion

    resolve( chain: IKChain, pose: Pose, debug?:any ): void{
        const root      = new Transform();
        let lnk: Link   = chain.first();

        // Get the Starting Transform
        if( lnk.pidx == -1 )    root.copy( pose.offset );
        else                    pose.getWorldTransform( lnk.pidx, root );

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        let i: number;

        // Set the Initial Local Space from the chain Bind Pose
        for( i=0; i < chain.count; i++ ){
            this._local[ i ].copy( chain.links[ i ].bind );
        }

        this._updateWorld( 0, root );   // Update World Space

        if( Vec3.lenSq( this.effectorPos, this._getTailPos() ) < this._minEffRng ){
            //console.log( 'CCD Chain is already at endEffector at initial call' );
            return;
        }

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        for( i=0; i < this._tries; i++ ){
            if( this._iteration( chain, pose, root, debug ) ) break; // Exit early if reaching effector
        }

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Save Results to Pose
        for( i=0; i < chain.count; i++ ){
            pose.setLocalRot( chain.links[ i ].idx, this._local[ i ].rot );
        }


        /*
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
        */
    }

    // Update the Iteration Transform Chain, helps know the position of 
    // each joint & end effector ( Last point on the chain )
    _updateWorld( startIdx: number, root: Transform ){
        const w     = this._world;
        const l     = this._local;
        let   i     : number;

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // HANDLE ROOT TRANSFORM
        if( startIdx == 0 ){
            w[ 0 ].fromMul( root, l[ 0 ] );     // ( Pose Offset * Chain Parent ) * First Link
            startIdx++;                         // Start on the Nex Transform
        }

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // HANDLE MIDDLE TRANSFORMS
        for( i=startIdx; i < w.length; i++ ){ 
            w[ i ].fromMul( w[ i-1 ], l[ i ] );     // Parent * Child
        }
    }

    _getTailPos(){ return this._world[ this._world.length - 1 ].pos; }

    _iteration( chain: IKChain, pose: Pose, root: Transform, debug ?:any ): boolean{
        const w         = this._world;
        const l         = this._local;
        const cnt       = w.length - 1;
        const tail      = w[ cnt ];
        const tailDir   = new Vec3();
        const effDir    = new Vec3();
        const lerpDir   = new Vec3();
        const q         = new Quat;
        const k         = this._kFactor;

        let   i         : number;
        let   diff      : number;
        let   b         : Transform;

        if( k ) k.reset();

        for( i=cnt-1; i >= 0; i-- ){                            // Skip End Effector Transform
            //--------------------------------------
            // Check how far tail is from End Effector
            diff = Vec3.lenSq( tail.pos, this.effectorPos );   // Distance Squared from Tail to Effector
            if( diff <= this._minEffRng ) return true;          // Point Reached, can Stop

            //--------------------------------------
            b = w[ i ];
            tailDir.fromSub( tail.pos,         b.pos ).norm();  // Direction from current joint to end effector
            effDir.fromSub(  this.effectorPos, b.pos ).norm();  // Direction from current joint to target

            if( k ) k.apply( chain, chain.links[ i ], tailDir, effDir, lerpDir );     // How Factor to Rotation Movement
            else    lerpDir.copy( effDir );

            q   .fromUnitVecs( tailDir, lerpDir )               // Create Rotation toward target
                .mul( b.rot );                                  // Apply to current World rotation

            if( i != 0 ) q.pmulInvert( w[ i-1 ].rot );          // To Local Space
            else         q.pmulInvert( root.rot );

            l[ i ].rot.copy( q );                               // Save back to bone

            //--------------------------------------             
            this._updateWorld( i, root );                       // Update Chain from this bone and up.
        }

        return false;
    }
}


/*
class KFactorCircle{
    constructor( c, r ){
        this.k = Maths.clamp( c / r, 0, 1 ); // K = Constant / Radius 
    }

    static fromChainLen( c, chainLen ){
        // Radius = ( 180 + ArcLength ) / ( PI * ArcAngle )
        let r = ( 180 * chainLen ) / ( Math.PI * Math.PI * 2 );
        return new KFactorCircle( c, r );
    }

    static fromChain( c, chain ){
        // Radius = ( 180 + ArcLength ) / ( PI * ArcAngle )
        let r = ( 180 * chain.len ) / ( Math.PI * Math.PI * 2 );
        return new KFactorCircle( c, r );
    }

    reset(){} // No State to reset

    apply( bone, effDir, tarDir, out ){
        out.from_lerp( effDir, tarDir, this.k ).norm();
    }
}
*/

class KFactorArcSqr{
    c       : number;
    offset  : number;
    arcLen  = 0;
    useInv  = false;

    constructor( c: number, offset: number, useInv = false ){
        this.c      = c;
        this.offset = offset;
        this.useInv = useInv;
    }

    reset(){ this.arcLen = 0; }

    apply( chain: IKChain, lnk: Link, tailDir: TVec3 , effDir: TVec3, out: Vec3 ){
        // Notes, Can do the inverse of pass in chain's length so chain.len - this.arcLen
        // This causes the beginning of the chain to move more and the tail less.
        this.arcLen += lnk.len;   // Accumulate the Arc length for each bone
        
        //const k = this.c / Math.sqrt( this.arcLen + this.offset );  // k = Constant / sqrt( CurrentArcLen )
        const k = ( !this.useInv )?
            this.c / Math.sqrt( this.arcLen + this.offset ) :
            this.c / Math.sqrt( ( chain.length - this.arcLen ) + this.offset )
        
        out.fromLerp( tailDir, effDir, k ).norm();
    }
}

/*

class KFactorArc{
    constructor( c, offset ){
        this.c      = c;
        this.arcLen = 0;
        this.offset = offset;
    }

    reset(){
        this.arcLen = 0;
    }

    apply( bone, effDir, tarDir, out ){
        // Notes, Can do the inverse of pass in chain's length so chain.len - this.arcLen
        // This causes the beginning of the chain to move more and the tail less.
        this.arcLen += bone.len;   //Accumulate the Arc length for each bone
        
        let k = this.c / ( this.arcLen + this.offset );  // k = Constant / CurrentArcLen
        
        out.from_lerp( effDir, tarDir, k ).norm();
    }
}

class KFactorOther{
    constructor( chainLen ){
        this.chainLen   = chainLen;
        this.arcLen     = 0;
        this.offset     = 0.1;
        this.scalar     = 1.3;
    }

    reset(){ this.arcLen = 0; }

    apply( bone, effDir, tarDir, out ){
        // Just messing around with numbers to see if there is ways to alter the movement of the chain
        this.arcLen += bone.len;
        let k = ( ( this.chainLen - this.arcLen + this.offset ) / ( this.chainLen*this.scalar ) )**2;
        out.from_lerp( effDir, tarDir, k ).norm();
    }
}
*/

export default NaturalCCDSolver;