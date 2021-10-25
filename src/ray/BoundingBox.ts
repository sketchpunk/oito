//#region IMPORT
import Vec3     from '../Vec3.js';
import type Ray from './Ray.js';
//#endregion


class RayBBoxResult{
    tMin        = 0;    // 0 > 1
    tMax        = 0;    // 0 > 1

    entryAxis   = 0;    // 0 : X, 1 : Y, 2 : Z
    entryNorm   = 0;    // -1 or 1 , Positive or Negative Axis
    exitAxis    = 0;    // 0 : X, 1 : Y, 2 : Z
    exitNorm    = 0;    // -1 or 1 , Positive or Negative Axis
    //constructor(){}

    getEntryNorm( out: Vec3, scl=1 ): Vec3{ return out.fromScale( Vec3.AXIS[ this.entryAxis ], this.entryNorm ).scale( scl ); }
    getExitNorm( out: Vec3, scl=1 ): Vec3 { return out.fromScale( Vec3.AXIS[ this.exitAxis ], this.exitNorm ).scale( scl ); }
}


// Optimization trick from ScratchAPixel
class AABBRay{
    vecLenInv = new Vec3();
    dir       = [ 0, 0, 0 ];

    constructor( ray ?: Ray ){
        if( ray ) this.fromRay( ray );
    }

    fromRay( ray: Ray ): void{
        this.vecLenInv.fromInvert( ray.vecLen );

        // Determine which bound will result in tMin so there will be no need to test if tMax < tMin to swop.
        this.dir[ 0 ] = ( this.vecLenInv.x < 0 )? 1 : 0;
        this.dir[ 1 ] = ( this.vecLenInv.y < 0 )? 1 : 0;
        this.dir[ 2 ] = ( this.vecLenInv.z < 0 )? 1 : 0;
    }
}


class BoundingBox{
    bounds = [ new Vec3(), new Vec3() ];
	constructor( min ?: TVec3, max ?: TVec3 ){
        if( min && max ) this.setBounds( min, max );
	}

    get min(): Vec3{ return this.bounds[ 0 ]; }
    set min( v: TVec3 ){ this.bounds[ 0 ].copy( v ); }

    get max(): Vec3{ return this.bounds[ 1 ]; }
    set max( v: TVec3 ){ this.bounds[ 1 ].copy( v ); }

    setBounds( min: TVec3, max: TVec3 ): this{
        this.bounds[ 0 ].copy( min );
        this.bounds[ 1 ].copy( max );
        return this;
    }

    rayIntersects( ray: Ray, raybox: AABBRay, results ?: RayBBoxResult ): boolean{
        let tMin, tMax, min, max, minAxis = 0, maxAxis = 0;
        const bounds = this.bounds;

        //X Axis ---------------------------
        tMin = ( bounds[	raybox.dir[0]].x - ray.origin.x ) * raybox.vecLenInv.x;
        tMax = ( bounds[1 -	raybox.dir[0]].x - ray.origin.x ) * raybox.vecLenInv.x;

        //Y Axis ---------------------------
        min = ( bounds[		raybox.dir[1]].y - ray.origin.y ) * raybox.vecLenInv.y;
        max = ( bounds[1 - 	raybox.dir[1]].y - ray.origin.y ) * raybox.vecLenInv.y;

        if(max < tMin || min > tMax) return false;	// if it criss crosses, its a miss
        if(min > tMin){ tMin = min; minAxis = 1; }	// Get the greatest min
        if(max < tMax){ tMax = max; maxAxis = 1; }	// Get the smallest max

        //Z Axis ---------------------------
        min = ( bounds[		raybox.dir[2]].z - ray.origin.z ) * raybox.vecLenInv.z;
        max = ( bounds[1 - 	raybox.dir[2]].z - ray.origin.z ) * raybox.vecLenInv.z;

        if(max < tMin || min > tMax) return false;	// if criss crosses, its a miss
        if(min > tMin){ tMin = min; minAxis = 2; }	// Get the greatest min
        if(max < tMax){ tMax = max; maxAxis = 2; }	// Get the smallest max

        //Finish ------------------------------
        //var ipos = dir.clone().scale(tMin).add(ray.start); //with the shortist distance from start of ray, calc intersection
        if( results ){
            results.tMin	    = tMin;
            results.tMax        = tMax;
            results.entryAxis	= minAxis; // 0 : X, 1 : Y, 2 : Z
            results.entryNorm	= ( raybox.dir[ minAxis ] == 1 )? 1 : -1;
            results.exitAxis    = maxAxis;
            results.exitNorm	= ( raybox.dir[ maxAxis ] == 1 )? -1 : 1;
        }
        return true;
    }
}


export { BoundingBox, AABBRay, RayBBoxResult };