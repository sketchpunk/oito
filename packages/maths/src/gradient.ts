import Maths from './maths';

class Gradient{
    //#region STEP
    static step( edge: number, x: number ) : number{ return ( x < edge )? 0 : 1; }

    /** t must be in the range of 0 to 1 */
    static smoothTStep( t: number ): number{ return t * t * ( 3 - 2 * t ); }

    static smoothStep( min: number, max: number, v: number ) : number { //https://en.wikipedia.org/wiki/Smoothstep
        v = Math.max( 0, Math.min( 1, (v-min) / (max-min) ) );
        return v * v * ( 3 - 2 * v );
    }

    static smootherStep( min: number, max: number, v: number ) : number {
        if ( v <= min ) return 0;
        if ( v >= max ) return 1;

        v = ( v - min ) / ( max - min );
        return v * v * v * ( v * ( v * 6 - 15 ) + 10 );
    }

    //#endregion

    //#region MISC

    /** See: https://www.iquilezles.org/www/articles/smin/smin.htm. */
    static smoothMin( a: number, b: number, k: number ): number{
        if( k != 0 ){
            const h = Math.max( k - Math.abs( a - b ), 0.0 ) / k;
            return Math.min( a, b ) - h * h * h * k * ( 1 / 6 );
        }else return Math.min(a, b);
    }

    static fade( t:number ): number{ return t * t * t * (t * (t * 6.0 - 15.0 ) + 10.0 ); }

    static gradient010( t: number ) : number{
        // Alt : f(x) = 1 - abs( 2x-1 ) should generate 010 without the condition
        const tt = t * 2;
        return ( tt > 1 )? 1 - (tt - 1) : tt;
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

    //#endregion

    //#region CURVES

    static parabola( x:number, k:number ){ return Math.pow( 4 * x * ( 1 - x ), k ); }
    
    static sigmoid( t: number, k=0 ){ // Over 0, Eases in the middle, under eases in-out
        // this uses the -1 to 1 value of sigmoid which allows to create easing at 
        // start and finish. Can pass in range 0:1 and it'll return that range.
        // https://dhemery.github.io/DHE-Modules/technical/sigmoid/
        // https://www.desmos.com/calculator/q6ukniiqwn
        return ( t - k*t ) / ( k - 2*k*Math.abs(t) + 1 );
    }

    static bellCurve( t: number ) : number{
        return ( Math.sin( 2 * Math.PI * ( t - 0.25 ) ) + 1 ) * 0.5;
    }

    /** a = 1.5, 2, 4, 9 */
    static betaDistCurve( t: number, a: number ): number{ 
        // https://stackoverflow.com/questions/13097005/easing-functions-for-bell-curves
        return 4 ** a * ( t * ( 1 - t ) ) ** a;
    }

    //#endregion
}

export default Gradient;