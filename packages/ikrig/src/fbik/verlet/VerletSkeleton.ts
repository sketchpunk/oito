//#region IMPORT
import type { TVec3 }                           from '@oito/type';
import type { IConstraint, IVerletPointConfig } from '../types';

import VerletPoint          from './VerletPoint';
import DistanceConstraint   from './constraints/DistanceConstraint';

import P4Cage               from './cages/P4Cage';
import AxisCage             from './cages/AxisCage';
import LimbCage             from './cages/LimbCage';
import TriExtCage from './cages/TriExtCage';
//#endregion


class VerletSkeleton{

    //#region MAIN
    points      : Array< VerletPoint >          = [];           // Skeleton is made of Points Linked by Constraints
    constraints : Array< IConstraint >          = [];           // Constraints Applied to Points
    iterations  = 5;                                            // How many times to execute constraints to be fully resolved.
    //pinnedList  : Map< number, boolean >        = new Map();    //
    constructor(){}
    //#endregion

    //#region POINTS
    
    newPoint( config ?: IVerletPointConfig ): VerletPoint{ 
        const pnt   =  new VerletPoint( config );
        pnt.idx     = this.points.length;
        this.points.push( pnt ); 
        return pnt;
    }

    setPos( idx: number, pos: TVec3 ){
        const p = this.points[ idx ];
        if( p ){
            p.pos[ 0 ] = pos[ 0 ];
            p.pos[ 1 ] = pos[ 1 ];
            p.pos[ 2 ] = pos[ 2 ];
        }
        return this;
    }

    /*
    setPinned( idx: number, state:boolean ): this{
        if( state == false ){
            //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            // Unpin
            if( this.pinnedList.has( idx ) ){
                this.points[ idx ].isPinned = false;
                this.pinnedList.delete( idx );
            }
        }else{
            //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            // Pin
            if( !this.pinnedList.has( idx ) ){ // Make sure its not pinned
                this.points[ idx ].isPinned = true;
                this.pinnedList.set( idx, true );
            }
        }

        return this
    }

    clearAllPins( idx: number ): this{
        for( let i of this.pinnedList.keys() ) this.points[ i ].isPinned = false;
        this.pinnedList.clear();
        return this;
    }
    */

    //#endregion ////////////////////////////////////////////////////

    //#region CONSTRAINTS

    /** Create a Cage around 4 points */
    newP4Cage( pHead: VerletPoint, pTail: VerletPoint, pRight: VerletPoint, pLeft: VerletPoint ): P4Cage{
        const cage = new P4Cage( this, pHead, pTail, pRight, pLeft );
        this.constraints.push( cage );
        return cage;
    }

    /** Create a Cage around two points */
    newAxisCage( pHead: VerletPoint, pTail: VerletPoint ): AxisCage{
        const cage = new AxisCage( this, pHead, pTail );
        this.constraints.push( cage );
        return cage;
    }

    /** Link 3 Points in a Chain */
    newLimbCage( pHead: VerletPoint, pPole: VerletPoint, pTail: VerletPoint ): LimbCage{
        const cage = new LimbCage( this, pHead, pPole, pTail );
        this.constraints.push( cage );
        return cage;
    }

    newTriExtCage( pHead: VerletPoint, useEffFromPole=false ): TriExtCage{
        const cage = new TriExtCage( this, pHead, useEffFromPole );
        this.constraints.push( cage );
        return cage;
    }

    /** Basic Distance Constraint */
    newLink( pHead: VerletPoint, pTail: VerletPoint ): DistanceConstraint{
        const con = new DistanceConstraint( pHead, pTail );
        this.constraints.push( con );
        return con;
    }

    /** Have constraints reset its values based */
    rebindConstraints(){
        let c: IConstraint;
        for( c of this.constraints ) c.rebind();
    }

    resolve(){
        let i   : number;
        let c   : IConstraint; 
        let chg : boolean;

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        for( i=0; i < this.iterations; i++ ){
            chg = false;
            
            for( c of this.constraints ){
                if( c.resolve() ) chg = true;
            }

            if( !chg ) break;  // Nothing has changed, Exit early.
        }
    }
    //#endregion ////////////////////////////////////////////////////

}

export default VerletSkeleton;