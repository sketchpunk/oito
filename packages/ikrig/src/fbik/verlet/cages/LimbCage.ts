//#region IMPORTS
import type VerletSkeleton  from '../VerletSkeleton';
import type VerletPoint     from '../VerletPoint';
import type { IConstraint } from '../../types';
import { TVec3 }            from '@oito/type';

import DistanceConstraint   from '../constraints/DistanceConstraint';
import { Vec3 }             from '@oito/core';
//#endregion

class LimbCage implements IConstraint{
    //#region MAIN
    prevPole    = [0, 0, 0 ];
    pHead       : VerletPoint; 
    pPole       : VerletPoint;
    pTail       : VerletPoint;
    constraints : Array<IConstraint> = []; // Constraints Applied to Points

    constructor( skel: VerletSkeleton, pHead: VerletPoint, pPole: VerletPoint, pTail: VerletPoint ){
        this.pHead     = pHead; 
        this.pPole     = pPole;
        this.pTail     = pTail;

        this.constraints.push(
            new DistanceConstraint( pHead, pPole ),
            new DistanceConstraint( pPole, pTail ),
        );
    }
    //#endregion

    rebind():void{
        let c: IConstraint;
        for( c of this.constraints ) c.rebind();
    }

    resolve(){
        let chg = false;
        let c: IConstraint;
        
        for( c of this.constraints ){
            if( c.resolve() ) chg = true;
        }

        return chg;
    }

    poleMode( isOn:boolean ): this{
        this.pHead.isPinned = isOn;
        return this;
    }

    getTailPos(): TVec3{ return this.pTail.pos; }

    getPoleDir( poleDir: TVec3 ): TVec3{
        const v0 = Vec3.sub( this.pTail.pos, this.pHead.pos ).norm();   // Fwd
        const v1 = Vec3.sub( this.pPole.pos, this.pHead.pos ).norm();   // Up

        if( Vec3.dot( v0, v1 ) < 0.999 ){
            const v2 = Vec3.cross( v1, v0 );    // Lft
            v1  .fromCross( v0, v2 )            // Orthogonal Up
                .norm()
                .copyTo( poleDir )
                .copyTo( this.prevPole );
        }else{
            poleDir[ 0 ] = this.prevPole[ 0 ];
            poleDir[ 1 ] = this.prevPole[ 1 ];
            poleDir[ 2 ] = this.prevPole[ 2 ];
        }

        return poleDir;
    }

    setPrevPole( poleDir: TVec3 ): this{
        this.prevPole[ 0 ] = poleDir[ 0 ];
        this.prevPole[ 1 ] = poleDir[ 1 ];
        this.prevPole[ 2 ] = poleDir[ 2 ];
        return this;
    }
}

export default LimbCage;