//#region IMPORTS
//import { DualQuat }     from '@oito/core.extend';
import DualQuat         from '@oito/core.extend/build/DualQuat.js';
import type ISkin       from './ISkin.js'
import type Armature    from '../Armature.js'
import type Pose        from '../Pose.js';

//#endregion

class SkinDQ implements ISkin {
    bind         !: Array< DualQuat >;
    world        !: Array< DualQuat >;

    //offsetBuffer !: Float32Array; // Mat2x4
    offsetQBuffer !: Float32Array;  // Vec4
    offsetPBuffer !: Float32Array;  // Vec4

    //world ?: Array< Mat4 >;
    //constructor(){}
    
    init( arm: Armature ): this{
        const bCnt  = arm.bones.length;
        const world = new Array( bCnt );
        const bind  = new Array( bCnt );

        for( let i=0; i < bCnt; i++ ){
            world[ i ]  = new DualQuat();
            bind[ i ]   = new DualQuat();
        }

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        let b;
        for( let i=0; i < bCnt; i++ ){
            b = arm.bones[ i ];
            
            world[ i ].fromQuatTran( b.local.rot, b.local.pos );        // Local Space DQ
            if( b.pidx != null ) world[ i ].pmul( world[ b.pidx ] );    // Add Parent if Available

            bind[ i ].fromInvert( world[ i ] );                         // Invert for Bind Pose
        }

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        this.bind           = bind;                            // Save Reference to Vars
        this.world          = world;

        //this.offsetBuffer  = new Float32Array( 8 * bCnt );   // Create Buffer Space
        this.offsetQBuffer   = new Float32Array( 4 * bCnt );   // 
        this.offsetPBuffer   = new Float32Array( 4 * bCnt );
        return this;
    }

    updateFromPose( pose: Pose ): this{
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Get Pose Starting Offset
        const offset = new DualQuat();
        offset.fromQuatTran( pose.offset.rot, pose.offset.pos );

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        const bOffset = new DualQuat();
        let i, b, ii;

        for( i=0; i < pose.bones.length; i++ ){
            b = pose.bones[ i ];

            //----------------------------------------
            // Compute Worldspace Matrix for Each Bone
            this.world[ i ].fromQuatTran( b.local.rot, b.local.pos );           // Local Space DQ
            if( b.pidx != null ) this.world[ i ].pmul( this.world[ b.pidx ] );  // Add Parent if Available
            else                 this.world[ i ].pmul( offset );                // Or use Offset on all root bones

            //----------------------------------------
            // Compute Offset Matrix that will be used for skin a mesh
            // Offset = Bone.World * Bone.Bind 
            bOffset
                .fromMul( this.world[ i ], this.bind[ i ] );
                //.toBuf( this.offsetBuffer, i * 8 );

            //----------------------------------------
            // For THREEJS support, Split DQ into Two Vec4
            ii = i * 4;
            this.offsetQBuffer[ ii + 0 ] = bOffset[ 0 ];
            this.offsetQBuffer[ ii + 1 ] = bOffset[ 1 ];
            this.offsetQBuffer[ ii + 2 ] = bOffset[ 2 ];
            this.offsetQBuffer[ ii + 3 ] = bOffset[ 3 ];

            this.offsetPBuffer[ ii + 0 ] = bOffset[ 4 ];
            this.offsetPBuffer[ ii + 1 ] = bOffset[ 5 ];
            this.offsetPBuffer[ ii + 2 ] = bOffset[ 6 ];
            this.offsetPBuffer[ ii + 3 ] = bOffset[ 7 ];
        }

        return this
    }

    getOffsets(): Array< unknown >{
        return [ this.offsetQBuffer, this.offsetPBuffer ];
    }
}

export default SkinDQ;