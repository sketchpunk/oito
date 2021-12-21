import type VerletPoint from '../VerletPoint';
import type IConstraint from './IConstraint';
import { Vec3 } from '@oito/core';


// Force a distance between Two Points
class DistanceConstraint implements IConstraint{
    //#region MAIN
    pa          : VerletPoint;
    pb          : VerletPoint;
    lenSq       = 0;
    len         = 0;

    // OPTIONS
    aAnchor     = false;    // First Point is always Pinned
    bAnchor     = false;    // Second Point is always Pinned
    isRanged    = false;    // Only Resolve if distance is OVER the len

    // Reuse, so not reallocating them.
    dir         = new Vec3();   
    v           = new Vec3();

    constructor( p0: VerletPoint, p1: VerletPoint ){
        this.pa          = p0;                             // First Point
        this.pb          = p1;                             // Second Point
        this.rebind();
    }
    //#endregion

    rebind():void{
        this.lenSq      = Vec3.lenSq( this.pa.pos, this.pb.pos );  // Distance Squared between Points
        this.len        = Math.sqrt( this.lenSq );                  // Distance between Points
    }

    ranged(){ this.isRanged = true; return this; }

    resolve(){
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // CHECKS
        
        // If both Points are Pinned, Dont bother
        if( this.pa.isPinned && this.pb.isPinned ) return false;

        // If distance is less then, then dont bother if its Ranged
        // Apply constraint when its over the max length.
        this.dir.fromSub( this.pa.pos, this.pb.pos );       // Vector Length
        const curLenSqr = this.dir.lenSq();                 // Len Squared for Quick Checks
        if( Math.abs( curLenSqr - this.lenSq ) < 0.0001 ||
            ( this.isRanged && curLenSqr <= this.lenSq ) ) return false;


        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        const stiffness = 1.0;                      // Max Total Ratio
        const curLen    = Math.sqrt( curLenSqr );   // Actual Distance
        const delta     = ( curLen == 0 )? this.len : ( this.len - curLen ) / curLen; // Normalize LenConstraint in relation to current distance of DIR


        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Create A & B Ration of how to divide the moment toward eachother.
        // If a Point is pinned, then the other point gets 100% of the movement
        // else the movement is based on the difference of mass each point represents.
        
        let aScl: number;
        let bScl: number;
        const aPin = ( this.aAnchor || this.pa.isPinned );
        const bPin = ( this.bAnchor || this.pb.isPinned );
        
        if( aPin && !bPin ){        aScl = 0;           bScl = stiffness; }
        else if( !aPin && bPin ){   aScl = stiffness;   bScl = 0; }
        else{
            // Compute the Weight between the Two Points using its mass
            aScl = ( this.pa.mass / (this.pa.mass + this.pb.mass) ) * stiffness;
            bScl = stiffness - aScl;    // Since Stiffness is the Max Weight value, Use that to get the inverse of A's Weight Ratio
        }

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Move Points closer or further apart to reach its ideal distance
        if( !aPin ){
            //this.pa.pos.add( this.v.fromScale( this.dir, aScl * delta ) );
            this.v.fromScale( this.dir, aScl * delta );
            this.pa.pos[ 0 ] += this.v[ 0 ];
            this.pa.pos[ 1 ] += this.v[ 1 ];
            this.pa.pos[ 2 ] += this.v[ 2 ];
        }

        if( !bPin ){
            //this.pb.pos.sub( this.v.fromScale( this.dir, bScl * delta ) );
            this.v.fromScale( this.dir, bScl * delta );
            this.pb.pos[ 0 ] -= this.v[ 0 ];
            this.pb.pos[ 1 ] -= this.v[ 1 ];
            this.pb.pos[ 2 ] -= this.v[ 2 ];
        }

        return true;
    }
}

export default DistanceConstraint;