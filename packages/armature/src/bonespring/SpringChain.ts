//#region IMPORTS
import type Armature        from '../Armature';
import type Pose            from '../Pose';
import type Bone            from '../Bone';
import type { ISpringType } from './index'

import SpringItem           from './SpringItem';
import SpringRot            from './SpringRot';
import SpringPos            from './SpringPos';
//#endregion

class SpringChain{
    static ROT = 0;
    static POS = 1;
    
    //#region MAIN
    items   : SpringItem[] = [];
    name    : string;
    spring  : ISpringType;
    constructor( name: string, type=0 ){
        this.name       = name;
        this.spring    = ( type == 1 )? new SpringPos() : new SpringRot();
    }
    //#endregion

    //#region SETTERS

    setBones( aryName: string[], arm: Armature, osc=5.0, damp=0.5 ): void{
        let   bn    : string;
        let   b     : Bone | null;
        let   spr   : SpringItem;

        for( bn of aryName ){
            b = arm.getBone( bn );
            if( b == null ){ console.log( 'Bone not found for spring: ', bn ); continue; }

            spr = new SpringItem( b.name, b.idx );
            spr.spring.setDamp( damp );
            spr.spring.setOscPerSec( osc );

            this.items.push( spr );
        }
    }

    setRestPose( pose: Pose ): void{ this.spring.setRestPose( this, pose ); }
    updatePose( dt: number, pose: Pose ): void{ this.spring.updatePose( this, pose, dt ); }

    //#endregion
}

export default SpringChain;