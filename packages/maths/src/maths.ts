class Maths{
    //#region CONSTANTS
    static PI_H         = 1.5707963267948966;
    static PI_2         = 6.283185307179586;
    static PI_2_INV     = 1 / 6.283185307179586;
    static PI_Q         = 0.7853981633974483;
    static PI_Q3        = 1.5707963267948966 + 0.7853981633974483;
    static PI_270       = Math.PI + 1.5707963267948966;
    static DEG2RAD      = 0.01745329251; // PI / 180
    static RAD2DEG      = 57.2957795131; // 180 / PI
    static EPSILON      = 1e-6;
    static PHI          = 1.618033988749895; // Goldren Ratio, (1 + sqrt(5)) / 2
    //#endregion ////////////////////////////////////////////////////////

    //#region OPERATIONS

    static clamp( v: number, min: number, max: number ) : number { return Math.max( min, Math.min( max, v ) ); }
    static clamp01( v: number ) : number { return Math.max( 0, Math.min( 1, v ) ); }

    static fract( f: number ) : number { return f - Math.floor( f ); }
    static near_zero( v: number) : number{ return (Math.abs(v) <= Maths.EPSILON)? 0 : v; }

    static toRad( v: number ) : number { return v * Maths.DEG2RAD; }
    static toDeg( v: number ) : number { return v * Maths.RAD2DEG; }
    static dotToDeg( dot: number ) : number{ return Maths.toDeg( Math.acos( Maths.clamp( dot, -1, 1 ) ) ); }

    static map( x: number, xMin: number, xMax: number, zMin: number, zMax: number) : number{ 
        return (x - xMin) / (xMax - xMin) * (zMax-zMin) + zMin;
    }
    
    static snap( x: number, step: number ): number { return Math.floor( x / step ) * step; }

    static norm( min: number, max: number, v: number ): number { return (v-min) / (max-min); }

    /** Modulas that handles Negatives
     * @example
     * Maths.mod( -1, 5 ) = 4 */
    static mod( a: number, b: number ) : number{	
        const v = a % b;
        return ( v < 0 )? b + v : v;
    }

    static asinc( x0: number ) : number{
        let   x  = 6 * ( 1-x0 );
        const x1 = x;  
        let   a  = x;                                        x *= x1; 
        a += x                  / 20.0;                      x *= x1; 
        a += x * 2.0             / 525.0;                    x *= x1; 
        a += x * 13.0            / 37800.0;                  x *= x1; 
        a += x * 4957.0          / 145530000.0;              x *= x1; 
        a += x * 58007.0         / 16216200000.0;            x *= x1;
        a += x * 1748431.0       / 4469590125000.0;          x *= x1; 
        a += x * 4058681.0       / 92100645000000.0;         x *= x1;
        a += x * 5313239803.0    / 1046241656460000000.0;    x *= x1;
        a += x * 2601229460539.0 / 4365681093774000000000.0; // x^10
        return Math.sqrt( a );
    }

    /* Adapted from GODOT-engine math_funcs.h. */
    static wrap( value: number, min: number, max: number ): number{
        const range = max - min;
        return ( range != 0 )? value - ( range * Math.floor( (value-min) / range) ) : min;
    }

    // http://www.rorydriscoll.com/2016/03/07/frame-rate-independent-damping-using-lerp/
    static damp( x: number, y: number, lambda: number, dt: number ): number {
        const ti = Math.exp( - lambda * dt );
        return x * ti + y * ( 1 - ti );
    }

    //static select( t:number, f:number, b:boolean ): number{ return b ? t : f; }
    static negateIf( val: number, b: boolean ): number { return b ? -val : val; }

    //#endregion ////////////////////////////////////////////////////////

    //#region INTERPOLATION

    static lerp( a: number, b: number, t: number ) : number{ return (1 - t) * a + t * b; }  //return a + t * (b-a); 

    /** CLerp - Circular Lerp - is like lerp but handles the wraparound from 0 to 360.
    This is useful when interpolating eulerAngles and the object crosses the 0/360 boundary. */
    static clerp( start : number, end : number, v : number) : number {
        // http://wiki.unity3d.com/index.php/Mathfx#C.23_-_Mathfx.cs
        const min  = 0.0, 
              max  = 360.0,
              half = Math.abs( ( max - min ) / 2.0 ), // half the distance between min and max
              es   = end - start;

        if( es < -half )     return start + ( ( (max - start) + end ) * v );
        else if( es > half ) return start + ( -( (max - end) + start ) * v );
        
        return start + es * v;
    }

    //#endregion ////////////////////////////////////////////////////////

    //#region TRIG
    static lawcosSSS( aLen: number, bLen: number, cLen: number ): number{
        // Law of Cosines - SSS : cos(C) = (a^2 + b^2 - c^2) / 2ab
        // The Angle between A and B with C being the opposite length of the angle.
        let v = ( aLen*aLen + bLen*bLen - cLen*cLen ) / ( 2 * aLen * bLen );
        if( v < -1 )		v = -1;	// Clamp to prevent NaN Errors
        else if( v > 1 )	v = 1;
        return Math.acos( v );
    }
    //#endregion ////////////////////////////////////////////////////////

    //#region RANDOM
    
    static rnd( min: number, max: number ) : number{ return Math.random() * (max - min) + min; }

    static rndLcg( seed: number ) : ()=>number {
        //https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
        //https://en.wikipedia.org/wiki/Lehmer_random_number_generator
        function lcg( a: number ) : number{ return a * 48271 % 2147483647; }

        seed = seed ? lcg( seed ) : lcg( Math.random() );

        return function(){ return (seed = lcg( seed )) / 2147483648; }
    }

    //#endregion ////////////////////////////////////////////////////////

    //#region LOOPS

    /** Loops between 0 and Len, once over len, starts over again at 0, like a sawtooth wave  */
    static repeat( t: number, len: number ) : number{ return Maths.clamp( t - Math.floor( t / len ) * len, 0, len ); }

    /** Loops back and forth between 0 and len, it functions like a triangle wave. */
    static pingPong( t: number, len: number ) : number{
        t = Maths.repeat( t, len * 2 );
        return len - Math.abs( t - len );
    }
    //static pingPong( a: number, b: number ){ return ( b != 0 ) ? Math.abs( Maths.fract( (a - b) / ( b * 2) ) * b * 2 - b) : 0.0; }

    //#endregion //////////////////////////////////////////////////////// 

    //#region MISC
    /** Remove Negitive Bit, then output binary string of the number */
    static dec2bin( dec: number ): string{ return ( dec >>> 0 ).toString( 2 ); }
    //#endregion


    //#region MISC
    // https://gist.github.com/jhermsmeier/72626d5fd79c5875248fd2c1e8162489
    /*

    function lonLatZoomXY( zoom, lon, lat ){
    const width     = Math.pow( 2, zoom );
    const height    = Math.pow( 2, zoom );
    const latRad    = ( lat * Math.PI ) / 180;
    const x         = ~~(( width * ( lon + 180 ) ) / 360 );
    const y         = ~~((( 1 - Math.asinh( Math.tan( latRad ) ) / Math.PI ) / 2.0 ) * height );
    return { x, y };
}

    static polar_to_cartesian( lon, lat, radius, out ){
        out = out || new Vec3();

        let phi 	= ( 90 - lat ) * Maths.DEG2RAD,
            theta 	= ( lon + 180 ) * Maths.DEG2RAD;

        out[0] = -(radius * Math.sin( phi ) * Math.sin(theta));
        out[1] = radius * Math.cos( phi );
        out[2] = -(radius * Math.sin( phi ) * Math.cos(theta));

        return out;
    }

    static cartesian_to_polar( v, out ){
        out = out || [0,0];

        let len = Math.sqrt( v[0]**2 + v[2]**2 );
        out[ 0 ] = Math.atan2( v[0], v[2] ) * Maths.RAD2DEG;
        out[ 1 ] = Math.atan2( v[1], len ) * Maths.RAD2DEG;
        return out;
    }

    // X and Y axis need to be normalized vectors, 90 degrees of eachother.
    static plane_circle(vecCenter, xAxis, yAxis, angle, radius, out){
        let sin = Math.sin(angle),
            cos = Math.cos(angle);
        out[0] = vecCenter[0] + radius * cos * xAxis[0] + radius * sin * yAxis[0];
        out[1] = vecCenter[1] + radius * cos * xAxis[1] + radius * sin * yAxis[1];
        out[2] = vecCenter[2] + radius * cos * xAxis[2] + radius * sin * yAxis[2];
        return out;
    }

    //X and Y axis need to be normalized vectors, 90 degrees of eachother.
    static plane_ellipse(vecCenter, xAxis, yAxis, angle, xRadius, yRadius, out){
        let sin = Math.sin(angle),
            cos = Math.cos(angle);
        out[0] = vecCenter[0] + xRadius * cos * xAxis[0] + yRadius * sin * yAxis[0];
        out[1] = vecCenter[1] + xRadius * cos * xAxis[1] + yRadius * sin * yAxis[1];
        out[2] = vecCenter[2] + xRadius * cos * xAxis[2] + yRadius * sin * yAxis[2];
        return out;
    }
    */
    //#endregion
}

/*
// https://en.wikipedia.org/wiki/List_of_prime_numbers#The_first_1000_prime_numbers
// https://www.iquilezles.org/www/articles/dontflip/dontflip.htm  

https://github.com/godotengine/godot/blob/master/core/math/math_funcs.h
static _ALWAYS_INLINE_ float lerp_angle(float p_from, float p_to, float p_weight) {
    float difference = fmod(p_to - p_from, (float)Math_TAU);
    float distance = fmod(2.0f * difference, (float)Math_TAU) - difference;
    return p_from + distance * p_weight;
}
*/

export default Maths;