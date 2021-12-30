//#region IMPORTS
import type VerletSkeleton  from '../VerletSkeleton';
import type VerletPoint     from '../VerletPoint';
import type { IConstraint } from '../../types';
import type { TVec3 }       from '@oito/type';

import DistanceConstraint   from '../constraints/DistanceConstraint';
import { Vec3 }             from '@oito/core';
//#endregion

class AxisCage implements IConstraint{
    //#region MAIN
    pHead     : VerletPoint; 
    pTail     : VerletPoint;
    pLeft     : VerletPoint;
    pPole    !: VerletPoint;

    constraints : Array<IConstraint> = []; // Constraints Applied to Points

    constructor( skel: VerletSkeleton, pHead: VerletPoint, pTail: VerletPoint ){
        this.pHead     = pHead; 
        this.pTail     = pTail;
        this.pPole     = skel.newPoint( { mass:1, pole:true } );
        this.pLeft     = skel.newPoint( { mass:1, pole:true, visible:false } );
        
        this.constraints.push(
            new DistanceConstraint( pHead, pTail ),
            new DistanceConstraint( pHead, this.pPole ),
            new DistanceConstraint( pHead, this.pLeft ),
            new DistanceConstraint( pTail, this.pLeft ),
            new DistanceConstraint( pTail, this.pPole ),
            new DistanceConstraint( this.pPole, this.pLeft ),
        );
    }
    //#endregion

    setHeadPos( p: TVec3 ): this{
        this.pHead.pos[ 0 ] = p[ 0 ];
        this.pHead.pos[ 1 ] = p[ 1 ];
        this.pHead.pos[ 2 ] = p[ 2 ];
        return this;
    }

    updatePole(){
        this.pPole.pos[ 0 ] = this.pHead.pos[ 0 ];
        this.pPole.pos[ 1 ] = this.pHead.pos[ 1 ];
        this.pPole.pos[ 2 ] = this.pHead.pos[ 2 ] + 0.1;
        this.pLeft.pos[ 0 ] = this.pHead.pos[ 0 ] + 0.1;
        this.pLeft.pos[ 1 ] = this.pHead.pos[ 1 ];
        this.pLeft.pos[ 2 ] = this.pHead.pos[ 2 ];
    }

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
        //this.pTail.isPinned = isOn;
        return this;
    }


    getAxis( effDir: TVec3, poleDir: TVec3 ): void{
        const v0 = Vec3.sub( this.pPole.pos, this.pHead.pos );  // Fwd
        const v1 = Vec3.sub( this.pLeft.pos, this.pHead.pos );  // Lft
        const v2 = Vec3.cross( v0, v1 );                        // Up

        v0.norm().copyTo( effDir );
        v2.norm().copyTo( poleDir );
    }
}

export default AxisCage;