//#region IMPORTS
import type VerletSkeleton  from '../VerletSkeleton';
import type VerletPoint     from '../VerletPoint';
import type { IConstraint } from '../../types';
import type { TVec3 }       from '@oito/type';

import DistanceConstraint   from '../constraints/DistanceConstraint';
import { Vec3 }             from '@oito/core';
//#endregion

class P4Cage implements IConstraint{
    //#region MAIN
    pHead     : VerletPoint; 
    pTail     : VerletPoint;
    pRight    : VerletPoint;
    pLeft     : VerletPoint;
    pPole    !: VerletPoint;

    constraints : Array< IConstraint > = []; // Constraints Applied to Points

    constructor( skel: VerletSkeleton, pHead: VerletPoint, pTail: VerletPoint, pRight: VerletPoint, pLeft: VerletPoint ){
        this.pHead     = pHead; 
        this.pTail     = pTail;
        this.pRight    = pRight;
        this.pLeft     = pLeft;
        this.pPole     = skel.newPoint( { mass:1, pole:true } );

        this.constraints.push(
            new DistanceConstraint( pRight, pLeft ),
            new DistanceConstraint( pRight, pTail ),
            new DistanceConstraint( pLeft, pTail ),

            new DistanceConstraint( pHead, this.pPole ),
            new DistanceConstraint( pHead, pTail ),
            new DistanceConstraint( pHead, pRight ),
            new DistanceConstraint( pHead, pLeft ),
            
            new DistanceConstraint( this.pPole, pTail ),
            new DistanceConstraint( this.pPole, pRight ),
            new DistanceConstraint( this.pPole, pLeft ),
        );
    }
    //#endregion

    updatePole(){
        this.pPole.pos[ 0 ] = this.pHead.pos[ 0 ];
        this.pPole.pos[ 1 ] = this.pHead.pos[ 1 ];
        this.pPole.pos[ 2 ] = this.pHead.pos[ 2 ] + 0.1;
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

    getHeadPos(): TVec3{ return this.pHead.pos; }

    getAxis( effDir: TVec3, poleDir: TVec3 ){
        const v0 = Vec3.sub( this.pPole.pos, this.pHead.pos );  // Fwd
        const v1 = Vec3.sub( this.pLeft.pos, this.pRight.pos ); // Lft
        const v2 = Vec3.cross( v0, v1 );                        // Up

        v0.norm().copyTo( effDir );
        v2.norm().copyTo( poleDir );
    }
}

export default P4Cage;