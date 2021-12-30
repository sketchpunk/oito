//#region IMPORTS
import type VerletSkeleton  from '../VerletSkeleton';
import type VerletPoint     from '../VerletPoint';
import type { IConstraint } from '../../types';
import type { TVec3 }       from '@oito/type';

import DistanceConstraint   from '../constraints/DistanceConstraint';
import { Vec3 }             from '@oito/core';
//#endregion

class TriExtCage implements IConstraint{
    //#region MAIN
    pHead   : VerletPoint; 
    pEff    : VerletPoint;
    pPole   : VerletPoint;

    useEffFromPole = false;

    constraints : Array<IConstraint> = []; // Constraints Applied to Points

    constructor( skel: VerletSkeleton, pHead: VerletPoint, useEffFromPole=false ){
        this.pHead          = pHead; 
        this.pEff           = skel.newPoint( { mass:1, pole:true } );
        this.pPole          = skel.newPoint( { mass:1, pole:true } );
        this.useEffFromPole = useEffFromPole;

        this.constraints.push(
            new DistanceConstraint( pHead, this.pEff ),
            new DistanceConstraint( this.pEff, this.pPole ),
            new DistanceConstraint( this.pPole, pHead ),
        );
    }
    //#endregion

    setPoleOffset( p:TVec3, effOff: TVec3, poleOff: TVec3 ): this{
        const v = new Vec3();
        if( this.useEffFromPole ){
            v   .fromAdd( p, poleOff )      // Get Pole Position
                .copyTo( this.pPole.pos )   // ... Save
                .add( effOff )              // Create Eff from Pole Position
                .copyTo( this.pEff.pos );
        }else{
            v   .fromAdd( p, poleOff )      // Get Pole from Pos
                .copyTo( this.pPole.pos )   // ... Save
                .fromAdd( p, effOff )       // Get Eff from Pos
                .copyTo( this.pEff.pos );
        }
        return this;
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
        return this;
    }

    getAxis( effDir: TVec3, poleDir: TVec3 ): void{
        const v = new Vec3();
        
        if( this.useEffFromPole ){
            v.fromSub( this.pHead.pos, this.pPole.pos ).norm().copyTo( poleDir );
            v.fromSub( this.pEff.pos, this.pPole.pos ).norm().copyTo( effDir );
        }else{
            v.fromSub( this.pPole.pos, this.pHead.pos ).norm().copyTo( poleDir );
            v.fromSub( this.pEff.pos, this.pHead.pos ).norm().copyTo( effDir );
        }
    }
}

export default TriExtCage;