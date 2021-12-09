//#region IMPORTS
//import { DualQuat }     from '@oito/core.extend';
import DualQuat                     from '@oito/core.extend/build/DualQuat.js';
import { Vec4 }                     from '@oito/core';
import type { ISkin, TTextureInfo } from './ISkin.js'
import type Armature                from '../Armature.js'
import type Pose                    from '../Pose.js';
//#endregion

const COMP_LEN = 8;             // 8 Floats
const BYTE_LEN = COMP_LEN * 4;  // 8 Floats * 4 Bytes Each

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
        const qIdent = new Vec4( 0,0,0,1 );
        const pIdent = new Vec4( 0,0,0,0 );

        // For THREEJS support, Split DQ into Two Vec4 since it doesn't support mat2x4 properly
        this.offsetQBuffer   = new Float32Array( 4 * bCnt );   // Create Flat Buffer Space
        this.offsetPBuffer   = new Float32Array( 4 * bCnt );

        for( let i=0; i < bCnt; i++ ){
            world[ i ]  = new DualQuat();
            bind[ i ]   = new DualQuat();

            qIdent.toBuf( this.offsetQBuffer, i * 4 );         // Init Offsets : Quat Identity
            pIdent.toBuf( this.offsetPBuffer, i * 4 );         // ...No Translation
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

    getTextureInfo( frameCount: number ): TTextureInfo{
        const boneCount         = this.bind.length;             // One Bind Per Bone
        const strideByteLength  = BYTE_LEN;                     // n Floats, 4 Bytes Each
        const strideFloatLength = COMP_LEN;                     // How many floats makes up one bone offset
        const pixelsPerStride   = COMP_LEN / 4;                 // n Floats, 4 Floats Per Pixel ( RGBA )
        const floatRowSize      = COMP_LEN * frameCount;        // How many Floats needed to hold all the frame data for 1 bone
        const bufferFloatSize   = floatRowSize * boneCount;     // Size of the Buffer to store all the data.
        const bufferByteSize    = bufferFloatSize * 4;          // Size of buffer in Bytes.
        const pixelWidth        = pixelsPerStride * frameCount; // How Many Pixels needed to hold all the frame data for 1 bone 
        const pixelHeight       = boneCount;                    // Repeat Data, but more user friendly to have 2 names depending on usage.

        const o : TTextureInfo = {
            boneCount,
            strideByteLength,
            strideFloatLength,
            pixelsPerStride,
            floatRowSize,
            bufferFloatSize,
            bufferByteSize,
            pixelWidth,
            pixelHeight,
        };

        return o;
    }
}

export default SkinDQ;