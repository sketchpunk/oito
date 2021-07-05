
// https://en.wikipedia.org/wiki/List_of_prime_numbers#The_first_1000_prime_numbers

class Maths{
    //#region CONSTANTS
    static PI_H			= 1.5707963267948966;
    static PI_2 		= 6.283185307179586;
    static PI_2_INV 	= 1 / 6.283185307179586;
    static PI_Q			= 0.7853981633974483;
    static PI_Q3 		= 1.5707963267948966 + 0.7853981633974483;
    static PI_270		= Math.PI + 1.5707963267948966;
    static DEG2RAD		= 0.01745329251; // PI / 180
    static RAD2DEG		= 57.2957795131; // 180 / PI
    static EPSILON		= 1e-6;
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
        a += x * 4058681.0       / 92100645000000.0;     	 x *= x1;
        a += x * 5313239803.0    / 1046241656460000000.0;    x *= x1;
        a += x * 2601229460539.0 / 4365681093774000000000.0; // x^10
        return Math.sqrt( a );
    }

    //#endregion ////////////////////////////////////////////////////////

    //#region INTERPOLATION / GRADIENTS

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

    //#region GRADIENTS

    static step( edge: number, x: number ) : number{ return ( x < edge )? 0 : 1; }

    /** t must be in the range of 0 to 1 */
    static smoothTStep( t: number ): number{ return t * t * ( 3 - 2 * t ); }
    
    static smoothStep( edge1: number, edge2: number, val: number ) : number { //https://en.wikipedia.org/wiki/Smoothstep
        const x = Math.max( 0, Math.min( 1, (val-edge1) / (edge2-edge1) ) );
        return x * x * ( 3 - 2 * x );
    }

    static gradient010( t: number ) : number{
        const tt = t * 2;
        return ( tt > 1 )? 1 - (tt - 1) : tt;
    }

    static bellCurve( t: number ) : number{
        return ( Math.sin( 2 * Math.PI * ( t - 0.25 ) ) + 1 ) * 0.5;
    }

    /** a = 1.5, 2, 4, 9 */
    static betaDistCurve( t: number, a: number ): number{ 
        // https://stackoverflow.com/questions/13097005/easing-functions-for-bell-curves
        return 4 ** a * ( t * ( 1 - t ) ) ** a;
    }

    /** bounce ease out */
    static bounce( t: number ) : number{
        return ( Math.sin(t * Math.PI * (0.2 + 2.5 * t * t * t)) * Math.pow(1  - t, 2.2) + t) * (1 + (1.2 * (1 - t)));
    }

    static noise( x: number ) : number{
        // <https://www.shadertoy.com/view/4dS3Wd> By Morgan McGuire @morgan3d, http://graphicscodex.com
        // https://gist.github.com/patriciogonzalezvivo/670c22f3966e662d2f83
        const i = Math.floor( x );
        const f = Maths.fract( x );
        const t = f * f * ( 3 - 2 * f );
        return Maths.lerp( 
            Maths.fract( Math.sin( i ) * 1e4 ),
            Maths.fract( Math.sin( i + 1.0 ) * 1e4 ), t );
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
}

export default Maths;