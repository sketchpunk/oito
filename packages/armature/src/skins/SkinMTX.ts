//#region IMPORTS
import { Mat4 }                     from '@oito/core';
import type { ISkin, TTextureInfo } from './ISkin.js'
import type Armature                from '../Armature.js'
import type Pose                    from '../Pose.js';
//#endregion

const COMP_LEN = 16;            // 16 Floats
const BYTE_LEN = COMP_LEN * 4;  // 16 Floats * 4 Bytes Each

class SkinMTX implements ISkin {
    bind         !: Mat4[];
    world        !: Mat4[];
    offsetBuffer !: Float32Array;

    //world ?: Array< Mat4 >;
    //constructor(){}
    
    init( arm: Armature ): this{
        const mat4Identity  = new Mat4();
        const bCnt          = arm.bones.length;
        const world         = new Array( bCnt );
        const bind          = new Array( bCnt );
        
        this.offsetBuffer   = new Float32Array( 16 * bCnt );    // Create Buffer Space
        
        for( let i=0; i < bCnt; i++ ){
            world[ i ]  = new Mat4();
            bind[ i ]   = new Mat4();
        }

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        let b;
        for( let i=0; i < bCnt; i++ ){
            b = arm.bones[ i ];

            world[ i ].fromQuatTranScale( b.local.rot, b.local.pos, b.local.scl );  // Local Space Matrix
            if( b.pidx != null ) world[ i ].pmul( world[ b.pidx ] );                // Add Parent if Available

            bind[ i ].fromInvert( world[ i ] );                                     // Invert for Bind Pose

            mat4Identity.toBuf( this.offsetBuffer, i * 16 );                        // Fill in Offset with Unmodified matrices
        }

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        this.bind           = bind;                             // Save Reference to Vars
        this.world          = world;
        return this;
    }

    updateFromPose( pose: Pose ): this{
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Get Pose Starting Offset
        const offset = new Mat4();
        offset.fromQuatTranScale( pose.offset.rot, pose.offset.pos, pose.offset.scl );

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        const bOffset = new Mat4();
        let i, b; 

        for( i=0; i < pose.bones.length; i++ ){
            b = pose.bones[ i ];

            //----------------------------------------
            // Compute Worldspace Matrix for Each Bone
            this.world[ i ].fromQuatTranScale( b.local.rot, b.local.pos, b.local.scl ); // Local Space Matrix
            if( b.pidx != null ) this.world[ i ].pmul( this.world[ b.pidx ] );          // Add Parent if Available
            else                 this.world[ i ].pmul( offset );                        // Or use Offset on all root bones

            //----------------------------------------
            // Compute Offset Matrix that will be used for skin a mesh
            // OffsetMatrix = Bone.WorldMatrix * Bone.BindMatrix 
            bOffset
                .fromMul( this.world[ i ], this.bind[ i ] )
                .toBuf( this.offsetBuffer, i * 16 );
        }

        return this
    }

    getOffsets(): Array< unknown >{
        return [ this.offsetBuffer ];
    }

    getTextureInfo( frameCount: number ): TTextureInfo{
        const boneCount         = this.bind.length;             // One Bind Per Bone
        const strideFloatLength = COMP_LEN;                     // How many floats makes up one bone offset
        const strideByteLength  = BYTE_LEN;                     // n Floats, 4 Bytes Each
        const pixelsPerStride   = COMP_LEN / 4;                 // n Floats, 4 Floats Per Pixel ( RGBA )
        const floatRowSize      = COMP_LEN * frameCount;        // How many Floats needed to hold all the frame data for 1 bone
        const bufferFloatSize   = floatRowSize * boneCount;     // Size of the Buffer to store all the data.
        const bufferByteSize    = bufferFloatSize * 4;          // Size of buffer in Bytes.
        const pixelWidth        = pixelsPerStride * frameCount; // How Many Pixels needed to hold all the frame data for 1 bone 
        const pixelHeight       = boneCount;                    // Repeat Data, but more user friendly to have 2 names depending on usage.

        const o : TTextureInfo = {
            boneCount,
            strideFloatLength,
            strideByteLength,
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

export default SkinMTX;