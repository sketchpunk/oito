import Util  from "./extra/Util.js";
import Vec3  from "../Vec3.js";
import Vec2  from "../Vec2.js";
import Maths from "../Maths.js";

class HexagonPillar{
    static get( pointyUp=true, radius=0.5, cornerScale=0.2, cornerDiv=3, capSize=0.2, offsetHeight=0.5 ) : TGeo{
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        const rtn : TGeo = {
            vertices : [],
            indices  : [],
            texcoord : [],
            normals  : [],
        };

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        let poly = createPolygon( radius, 6, (pointyUp)? 30*Math.PI/180 : 0 );  // Create Base Shape
        poly = polyBevel( poly, cornerScale, cornerDiv );                       // Round the Shape Corners

        // Base Layer
        toVec3( rtn, poly );                
        const vertCnt = rtn.vertices.length / 3;

        // Starting layer for Cap.
        toVec3( rtn, poly, [0,offsetHeight,0] );     

        // Extra Layers for Bevel
        polyCapBevel( rtn, poly, cornerDiv, capSize, [0,offsetHeight,0] );
        const idxTip  = rtn.vertices.length;

        // Cap Center Point
        rtn.vertices.push( 0, capSize + offsetHeight, 0 );
        rtn.normals.push( 0,1,0 );

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Indices
        const idx = idxTip / 3;

        Util.gridIndicesCol( rtn.indices, vertCnt, 2 + cornerDiv, 0, true, true );
        Util.fanIndices( rtn.indices, idx, idx-vertCnt, idx-1, true );
        
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        return rtn;
    }
}

// Create the basic 2d polygon shape 
function createPolygon( radius:number, sides=6, offset=0 ) : Array<number> {
    const poly : Array<number> = [];
    let i : number, rad : number;

    for( i=0; i < sides; i++ ){
        rad = Math.PI * 2 * ( i / sides );
        poly.push( Math.cos( rad + offset ) * radius, Math.sin( rad + offset ) * radius );
    }

    return poly;
}

// Bevel the corners of polygon
function polyBevel( poly: Array<number>, cornerScale = 0.2, cornerDiv = 3 ){
    const polyOut : Array<number> = [];
    const len   = poly.length / 2;
    const a     = new Vec2();   // 3 Points that forms a Polygon Corner
    const b     = new Vec2();
    const c     = new Vec2();

    const va    = new Vec2();   // Min/Max Points of the corner to bevel
    const vb    = new Vec2();

    const norma = new Vec2();   // Inward Normals of the Corner Edges
    const normb = new Vec2();

    const pivot = new Vec2();   // Pivot point to create curved points
    const v     = new Vec2();

    let ii, i, j, k, radius;

    for( j=0; j < len; j++ ){
        i = Maths.mod( j-1, len );  // Previous Point
        k = Maths.mod( j+1, len );  // Next Point
        
        a.fromBuf( poly, i*2 );     // Get the Point Positions out of flat buffer
        b.fromBuf( poly, j*2 );
        c.fromBuf( poly, k*2 );

        va.fromLerp( a, b, 1.0 - cornerScale );       // Get the two points to start and end curved corner
        vb.fromLerp( b, c, cornerScale );

        norma.fromSub( b, a ).perpCCW().norm(); // Compute Inward normal of the two edges
        normb.fromSub( c, b ).perpCCW().norm();

        raysIntersection( va, norma, vb, normb, pivot );    // Point where the 2 normals converge.

        radius = Vec2.len( va, pivot );                     // Get the Radius for the curved corner
        
        va.pushTo( polyOut );
        for( ii=1; ii < cornerDiv; ii++ ){                  // Fill in the remaining points
            v   .fromLerp( va, vb, ii / cornerDiv )         // Lerp between Start + end Points
                .sub( pivot )                               // Localize it
                .norm()                                     // Normalize it
                .scale( radius )                            // Scale it to the radius
                .add( pivot )                               // Move it back to world space
                .pushTo( polyOut );
        }
        vb.pushTo( polyOut );
    }

    return polyOut;
}

// Turn 2D Polygon Points into 3D Vertices
function toVec3( geo: TGeo, poly: Array<number>, offset ?: TVec3 ) : void{
    const v = new Vec3();
    let i;
    offset = offset || [ 0,0,0 ];

    for( i of Vec2.bufIter( poly ) ){
        v.fromVec2( i, true )
            .add( offset )
            .pushTo( geo.vertices )
            .sub( offset )
            .norm()
            .pushTo( geo.normals );
    }
}

// Create a Beveled cap for the extruded walls
function polyCapBevel( geo: TGeo, poly: Array<number>, cornerDiv:number, capSize:number, offset ?: TVec3 ){
    const v     = new Vec2();
    const lerp  = [];

    let pivot, top, pnt, i, vlen, tlen;

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    offset = offset || [ 0,0,0 ];
    for( i=0; i < poly.length; i+=2 ){
        v.fromBuf( poly, i );
        
        vlen = v.len();
        tlen = vlen - capSize;

        pnt   = new Vec3().fromVec2( v, true );
        pivot = Vec3.scale( pnt, tlen / vlen );
        top   = Vec3.add( pivot, [0,capSize,0] );

        lerp.push( { pivot, top, pnt } );
    }

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    let t, itm;
    pnt = new Vec3();

    for( i=1; i <= cornerDiv; i++ ){
        t = i / cornerDiv;
        for( itm of lerp ){
            pnt .fromLerp( itm.pnt, itm.top, t )
                .sub( itm.pivot )
                .norm()
                .pushTo( geo.normals )
                .scale( capSize )
                .add( itm.pivot )
                .add( offset )
                .pushTo( geo.vertices );
        }
    }
}

//https://stackoverflow.com/questions/2931573/determining-if-two-rays-intersect
function raysIntersection( as: TVec2, ad: TVec2, bs: TVec2, bd: TVec2, out: TVec2 ) {
    const dx    = bs[0] - as[0];
    const dy    = bs[1] - as[1];
    const det   = bd[0] * ad[1] - bd[1] * ad[0];

    if( det != 0 ){ // near parallel line will yield noisy results
        const u = ( dy * bd[0] - dx * bd[1] ) / det;
        const v = ( dy * ad[0] - dx * ad[1] ) / det;
        
        if( u >= 0 && v >= 0 ){
            out[ 0 ] = as[ 0 ] + ad[ 0 ] * u;
            out[ 1 ] = as[ 1 ] + ad[ 1 ] * u;
            return true;
        }
    }
    return false;
}

export default HexagonPillar;