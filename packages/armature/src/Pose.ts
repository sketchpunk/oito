//#region IMPORTS
import type { TVec3, TVec4 }    from '@oito/types';
import { Quat, Transform }      from '@oito/core';
import type Armature            from './Armature.js';
import type Bone                from './Bone.js';

import type { Pose as GLPose, PoseJoint as GLPoseJoint }   from '../../gltf2/src/Pose';
//#endregion

class Pose{
    //#region MAIN
    arm     !: Armature;
    bones   !: Bone[];          // Clone of Armature Bones
    offset  = new Transform();  // Pose Transform Offset, useful to apply parent mesh transform

    constructor( arm ?: Armature ){
        if( arm ){
            const bCnt = arm.bones.length;
            this.bones = new Array( bCnt );
            this.arm   = arm;

            for( let i=0; i < bCnt; i++ ){
                this.bones[ i ] = arm.bones[ i ].clone();
            }

            this.offset.copy( this.arm.offset );
        }
    }
    //#endregion


    //#region GETTERS
    /** Get Bone by Name */
    get( bName: string ) : Bone | null{
        const bIdx = this.arm.names.get( bName );
        return ( bIdx !== undefined )? this.bones[ bIdx ] : null;
    }

    getBoneWorldPos( bIdx: number ): number[]{
        return this.bones[ bIdx ].world.pos.toArray();
    }

    clone() : Pose{
        const bCnt  = this.bones.length;
        const p     = new Pose();
        
        p.arm   = this.arm;
        p.bones = new Array( bCnt );
        p.offset.copy( this.offset );

        for( let i=0; i < bCnt; i++ ){
            p.bones[ i ] = this.bones[ i ].clone();
        }

        return p;
    }
    //#endregion


    //#region SETTERS

    setLocalPos( bone: number|string, v: TVec3 ): this{
        const bIdx = (typeof bone === 'string' )? this.arm.names.get( bone ) : bone;        
        if( bIdx != undefined ) this.bones[ bIdx ].local.pos.copy( v );
        return this;
    }
    
    setLocalRot( bone: number|string, v: TVec4 ): this{
        const bIdx = (typeof bone === 'string' )? this.arm.names.get( bone ) : bone;        
        if( bIdx != undefined ) this.bones[ bIdx ].local.rot.copy( v );
        return this;
    }

    fromGLTF2( glPose: GLPose ): this{
        let jnt : GLPoseJoint;
        let b   : Bone;
        for( jnt of glPose.joints ){
            b = this.bones[ jnt.index ];
            if( jnt.rot ) b.local.rot.copy( jnt.rot );
            if( jnt.pos ) b.local.pos.copy( jnt.pos );
            if( jnt.scl ) b.local.scl.copy( jnt.scl );
        }

        this.updateWorld();
        return this;
    }

    copy( pose: Pose ): this{
        const bLen = this.bones.length;

        for( let i=0; i < bLen; i++ ){
            this.bones[ i ].local.copy( pose.bones[ i ].local );
            this.bones[ i ].world.copy( pose.bones[ i ].world );
        }

        return this;
    }

    //#endregion
    

    //#region OPERATIONS
    rotLocal( bone: number|string, deg:number, axis='x' ): this{
        const bIdx = (typeof bone === 'string' )? this.arm.names.get( bone ) : bone;        
        if( bIdx != undefined ){
            const q     = this.bones[ bIdx ].local.rot;
            const rad   = deg * Math.PI / 180;
            switch( axis ){
                case 'y'    : q.rotY( rad ); break;
                case 'z'    : q.rotZ( rad ); break;
                default     : q.rotX( rad ); break;
            } 
        }else console.warn( 'Bone not found, ', bone );
        return this;
    }

    moveLocal( bone: number|string, offset:TVec3 ): this{
        const bIdx = (typeof bone === 'string' )? this.arm.names.get( bone ) : bone;        
        if( bIdx != undefined ) this.bones[ bIdx ].local.pos.add( offset );
        else                    console.warn( 'Bone not found, ', bone );
        return this;
    }

    sclLocal( bone: number|string, v: number | TVec3 ): this{
        const bIdx = (typeof bone === 'string' )? this.arm.names.get( bone ) : bone;        
        if( bIdx != undefined ){
            if( Array.isArray( v ) || v instanceof Float32Array )
                this.bones[ bIdx ].local.scl.copy( v );
            else
                this.bones[ bIdx ].local.scl.xyz( v, v, v );
        }else console.warn( 'Bone not found, ', bone );

        return this;
    }
    //#endregion


    //#region COMPUTE
    updateWorld( useOffset=true ): this{
        let i, b;
        for( i=0; i < this.bones.length; i++ ){
            b = this.bones[ i ];

            if( b.pidx != null ) b.world.fromMul( this.bones[ b.pidx ].world, b.local );
            else if( useOffset ) b.world.fromMul( this.offset, b.local );
            else                 b.world.copy( b.local );                      
        }

        return this;
    }

    getWorldTransform( bIdx: number, out ?: Transform ): Transform{
        out ??= new Transform();
        
        let bone = this.bones[ bIdx ];  // get Initial Bone
        out.copy( bone.local );         // Starting Transform

        // Loop up the heirarchy till we hit the root bone
        while( bone.pidx != null ){
            bone = this.bones[ bone.pidx ];
            out.pmul( bone.local );
        }

        // Add offset at the end
        out.pmul( this.offset );
        return out;
    }

    getWorldRotation( bIdx: number, out ?: Quat ): Quat{
        out ??= new Quat();
        
        let bone = this.bones[ bIdx ];  // get Initial Bone
        out.copy( bone.local.rot );     // Starting Rotation

        // Loop up the heirarchy till we hit the root bone
        while( bone.pidx != null ){
            bone = this.bones[ bone.pidx ];
            out.pmul( bone.local.rot );
        }

        // Add offset at the end
        out.pmul( this.offset.rot );
        return out;
    }
    //#endregion
}

export default Pose;