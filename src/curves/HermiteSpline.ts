import Maths    from "../Maths.js";
import Vec3     from "../Vec3.js";

class Point{
    pos     : Vec3 = new Vec3();
    tension : number;
    bias    : number;
    constructor( pos: TVec3, tension=0, bias=0 ){
        this.pos.copy( pos );
        this.tension = tension;
        this.bias    = bias;
    }
}

class HermiteSpline{

    //#region MAIN
    points : Array<Point> = []; // All the Points that defines all the curves of the Spline
    _curve_cnt  = 0;            // How many curves make up the spline
    _point_cnt  = 0;            // Total points in spline
    _is_loop    = false;        // Is the spline closed? Meaning should the ends be treated as another curve
    
    // Private PreComputed Values for each sample of the curve
    time        = 0;    // Time of the selected curve of the spline
    tension	    = 0;    // Lerped Tension between end points of curve
    bias        = 0;    // Lerped Bias between end points of curve
    ten_bias_p  = 0;    // Precomputed Value thats uses often
    ten_bias_n  = 0;    // Precomputed Value thats uses often

    constructor( isLoop=false ){
        this._is_loop = isLoop;
    }
    //#endregion ////////////////////////////////////////////////////////

    //#region GETTERS / SETTERS
    get curveCount() : number{ return this._curve_cnt; }
    get pointCount() : number{ return this._point_cnt; }
    //#endregion ////////////////////////////////////////////////////////

    //#region MANAGE POINTS
    add( pos: TVec3, tension=0, bias=0 ) : HermiteSpline{
        this.points.push( new Point( pos, tension, bias ) );
        this._point_cnt = this.points.length;
        this._curve_cnt = ( !this._is_loop )?
            Math.max( 0, this._point_cnt - 3 ) :
            this._point_cnt;
        return this;
    }
    
    updatePos( idx: number, pos: TVec3 ): HermiteSpline{ 
        this.points[ idx ].pos.copy( pos ); 
        return this;
    }

    /** Update point position using a XYZ Struct, make it easier to use THREE.JS */
    updatePosStruct( idx: number, pos: TVec3Struct ) : HermiteSpline{
        this.points[ idx ].pos.fromStruct( pos );
        return this;
    }
    //#endregion ////////////////////////////////////////////////////////

    //#region SPLINE
    /** Get position / first derivative of the curve */
    at( t: number, pos ?: TVec3, dxdy ?: TVec3 ) : TVec3{
        const i = ( !this._is_loop )? this._nonLoopIndex( t ) : this._loopIndex( t );
        const a = this.points[ i[ 0 ] ].pos;
        const b = this.points[ i[ 1 ] ].pos;
        const c = this.points[ i[ 2 ] ].pos;
        const d = this.points[ i[ 3 ] ].pos;

        if( pos )  this._at( a, b, c, d, this.time, pos );
        if( dxdy ) this._dxdy( a, b, c, d, this.time, dxdy );

        return pos || dxdy;
    }

    /** Get position / first derivative of specific curve on the spline  */
    atCurve( idx: number, t: number, pos ?: TVec3, dxdy ?: TVec3 ) : TVec3{
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        if( t < 0 )      t = 0;
        else if( t > 1 ) t = 1;

        const i  = ( this._is_loop )? idx : idx+1;
        const ia = Maths.mod( i-1, this._point_cnt );   // Get Previous Point as Starting Tangent
        const ic = Maths.mod( i+1, this._point_cnt );   // Get Next point is the end point of the curve
        const id = Maths.mod( i+2, this._point_cnt );   // The the following point as the Ending Tangent
        this._precalcParams( t, i, ic );

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        const a = this.points[ ia ].pos;
        const b = this.points[ i  ].pos;
        const c = this.points[ ic ].pos;
        const d = this.points[ id ].pos;

        if( pos )  this._at( a, b, c, d, this.time, pos );
        if( dxdy ) this._dxdy( a, b, c, d, this.time, dxdy );

        return pos || dxdy;
    }
    //#endregion ////////////////////////////////////////////////////////

    //#region COMPUTE
    /** Compute the indexes of the curve if the spline isn't a closed loop */
    _nonLoopIndex( t:number ) : [number, number, number, number]{
        let i: number, tt: number;
        if( t > 1 ) t = 1;
        if( t < 0 ) t = 0;

        if( t != 1 ){
            tt	= t * this._curve_cnt;  // Using Curve count as a way to get the Index and the remainder is the T of the curve
            i 	= tt | 0;	            // Curve index by stripping out the decimal, BitwiseOR 0 same op as Floor
            tt	-= i;		            // Strip out the whole number to get the decimal norm to be used for the curve ( FRACT )
        }else{
            i	= this._point_cnt - 4;  // The last 4 points make up the final curve in the spline
            tt	= 1;                    // The end of the final curve.
        }

        this._precalcParams( tt, i+1, i+2 );
        return [ i, i+1, i+2, i+3 ];
    }

    /** Compute the indexes of the curve if the spline is a closed loop */
    _loopIndex( t:number ) : [number, number, number, number]{
        let i: number, tt: number;
        if( t > 1 ) t = 1;
        if( t < 0 ) t = 0;

        if( t != 1 ){
            tt  = t * this._point_cnt;   // Find the starting point for a curve.
            i   = tt | 0;                // Curve index by stripping out the decimal, BitwiseOR 0 same op as Floor
            tt -= i;	                 // Strip out the whole number to get the decimal norm to be used for the curve ( FRACT )
        }else{
            i   = this._point_cnt - 1;   // Use the last point as the starting point
            tt  = 1;
        }	

        const ia = Maths.mod( i-1, this._point_cnt );   // Get Previous Point as Starting Tangent
        const ic = Maths.mod( i+1, this._point_cnt );   // Get Next point is the end point of the curve
        const id = Maths.mod( i+2, this._point_cnt );   // The the following point as the Ending Tangent

        this._precalcParams( tt, i, ic );
        return [ ia, i, ic, id ];
    }

    /** Precompute and cache values for every at call, for optimization */
    _precalcParams( t: number, bi: number, ci: number ) : void{
        // Pre-caluate Paramters for Curve & Derivative Equations
        const ti        = 1 - t;
        this.time       = t;

        // Lerp Tension and Biass between the main 2 points of the curve
        this.tension    = ti * this.points[ bi ].tension    + t * this.points[ ci ].tension;
        this.bias       = ti * this.points[ bi ].bias       + t * this.points[ ci ].bias;

        // Main Equation uses these values 4 times per component, Better
        // to precompute now for optimization
        this.ten_bias_n	= ( 1 - this.bias ) * ( 1 - this.tension ) * 0.5;
        this.ten_bias_p	= ( 1 + this.bias ) * ( 1 - this.tension ) * 0.5;
    }

    _at( a: TVec3, b: TVec3, c: TVec3, d: TVec3, t:number, out: TVec3 ) : TVec3{
        const   t2 = t * t,
                t3 = t2 * t,
                a0 = 2*t3 - 3*t2 + 1,
                a1 = t3 - 2*t2 + t,
                a2 = t3 - t2,
                a3 = -2*t3 + 3*t2;

        out[ 0 ] = a0*b[0] + a1 * ( (b[0]-a[0]) * this.ten_bias_p + (c[0]-b[0]) * this.ten_bias_n ) + a2 * ( (c[0]-b[0]) * this.ten_bias_p + (d[0]-c[0]) * this.ten_bias_n ) + a3*c[0];
        out[ 1 ] = a0*b[1] + a1 * ( (b[1]-a[1]) * this.ten_bias_p + (c[1]-b[1]) * this.ten_bias_n ) + a2 * ( (c[1]-b[1]) * this.ten_bias_p + (d[1]-c[1]) * this.ten_bias_n ) + a3*c[1];
        out[ 2 ] = a0*b[2] + a1 * ( (b[2]-a[2]) * this.ten_bias_p + (c[2]-b[2]) * this.ten_bias_n ) + a2 * ( (c[2]-b[2]) * this.ten_bias_p + (d[2]-c[2]) * this.ten_bias_n ) + a3*c[2];
        return out;
    }

    _dxdy( a: TVec3, b: TVec3, c: TVec3, d: TVec3, t:number, out: TVec3 ) : TVec3{
        const   tt  = t * t,
                tt6 = 6 * tt,
                tt3 = 3 * tt,
                a0  = tt6 - 6*t,
                a1  = tt3 - 4*t + 1,
                a2  = tt3 - 2*t,
                a3  = 6*t - tt6;

         out[ 0 ] = a0 * b[0] + a1 * ( (b[0]-a[0]) * this.ten_bias_p  + (c[0]-b[0]) * this.ten_bias_n ) + a2 * ( (c[0]-b[0]) * this.ten_bias_p  + (d[0]-c[0]) * this.ten_bias_n ) + a3 * c[0];
         out[ 1 ] = a0 * b[1] + a1 * ( (b[1]-a[1]) * this.ten_bias_p  + (c[1]-b[1]) * this.ten_bias_n ) + a2 * ( (c[1]-b[1]) * this.ten_bias_p  + (d[1]-c[1]) * this.ten_bias_n ) + a3 * c[1];
         out[ 2 ] = a0 * b[2] + a1 * ( (b[2]-a[2]) * this.ten_bias_p  + (c[2]-b[2]) * this.ten_bias_n ) + a2 * ( (c[2]-b[2]) * this.ten_bias_p  + (d[2]-c[2]) * this.ten_bias_n ) + a3 * c[2];
         return out;
    }
    //#endregion ////////////////////////////////////////////////////////

}

export default HermiteSpline;