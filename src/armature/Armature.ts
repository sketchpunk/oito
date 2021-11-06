//#region IMPORTS
import type ISkin   from './skins/ISkin.js'
import Bone         from './Bone.js';
import Pose         from './Pose.js';

import Vec3         from '../Vec3.js';
//#endregion

class Armature{
    //#region MAIN
    names  : Map<string, number>    = new Map();
    bones  : Array<Bone>            = [];
    skin  ?: ISkin;
    //#endregion

    //#region METHODS
	addBone( name: string, pidx ?: number, rot ?: TVec4, pos ?: TVec3, scl ?: TVec3 ): Bone{
		const idx   = this.bones.length;
		const bone  = new Bone( name, idx );
        
        this.bones.push( bone );
        this.names.set( name, idx );

        if( pos || rot || scl )                 bone.setLocal( rot, pos, scl );
        if( pidx != null && pidx != undefined ) bone.pidx = pidx;
		
		return bone;
    }

    bind( skin: new()=>ISkin ): this{
        this.updateWorld();                         // Compute WorldSpace Transform for all the bones
        this.updateBoneLengths();                   // Compute the length of all the Bones
        this.skin = new skin().init( this );        // Setup Skin BindPose
        return this;
    }
    //#endregion

    //#region GETTERS
    newPose(): Pose{ return new Pose( this ); }

    getBone( bName: string ): Bone | null {
        const idx = this.names.get( bName );
        if( idx == undefined ) return null;
        return this.bones[ idx ];
    }

    getSkinOffsets( ): Array<unknown> | null{
        return ( this.skin )? this.skin.getOffsets() : null;
    }
    //#endregion

    //#region COMPUTE
    updateSkinFromPose( pose: Pose ): Array<unknown> | null{
        if( this.skin ){
            this.skin.updateFromPose( pose );
            return this.skin.getOffsets();
        }
        return null;
    }

    updateWorld(): this{
        const bCnt = this.bones.length;
        let b;

        for( let i=0; i < bCnt; i++ ){
            b = this.bones[ i ];
            if( b.pidx != null ) b.world.fromMul( this.bones[ b.pidx ].world, b.local );
            else                 b.world.copy( b.local );
        }

        return this;
    }

    updateBoneLengths(): this{
        const bCnt = this.bones.length;
        let b : Bone, p : Bone;

        for( let i=bCnt-1; i >= 0; i-- ){
            //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            b = this.bones[ i ];
            if( b.pidx == null ) continue;

            //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            p = this.bones[ b.pidx ];
            p.len = Vec3.len( p.world.pos, b.world.pos );
        }   

        return this;
    }
    //#endregion
}

export default Armature;