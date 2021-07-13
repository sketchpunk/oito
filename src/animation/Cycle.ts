import Maths from "../Maths.js";

class Cycle{
    // #region MAIN
    _value      = 0;            // Current Cycle Value
    _cycleInc   = 0;           // How much to move per millisecond
    _speedScale = 1.0;	// Scale the rate of the cycle
    onUpdate    ?: ( c:Cycle )=>void;

	constructor( sec=1 ){
        this.setSeconds( sec ); 
	}
    // #endregion

    // #region METHODS
	setSeconds( s:number ) : Cycle{ this._cycleInc = Maths.PI_2 / ( s * 1000 ); return this; }

    /** Change Cycle to Update in a negative direction */
	backwards() : Cycle{ if( this._speedScale > 0 ) this._speedScale *= -1; return this; }

    /** Change Cycle to Update in a positive direction */
	forwards() : Cycle{  if( this._speedScale < 0 ) this._speedScale *= -1; return this; }

    /** Update the cycle using a Delta Time value, fractions of a second usually */
    update( dt: number ) : Cycle{
        this._value = ( this._value + ( dt * 1000 * this._speedScale ) * this._cycleInc ) % Maths.PI_2;
        if( this.onUpdate ) this.onUpdate( this );
		return this;
	}
    // #endregion

    // #region BASIC GETTERS
    /** Get Cycle Value, 0 to 360 degrees in radians */
	get( offset=0 ) : number{ return Maths.mod( this._value + offset, Maths.PI_2 ); }
    
    /** Get Normalized Cycle Value - Range 0:1  */
    asCycle01( offset=0 ) : number{ return this.get( offset ) * Maths.PI_2_INV; }

    /** Get Normalized Cycle Value - Range -1:1  */
    asCycleN11( offset=0 ) : number{ return this.get( offset ) * Maths.PI_2_INV * 2.0 - 1.0; } // -1 : 1

    /** Get Normalized Cycle Value that has been remapped into 0:1:0 */
    asCycle010( offset=0 ) : number{ 
        const n = this.get( offset ) * Maths.PI_2_INV * 2;
        return ( n > 1 )? 1 - (n - 1) : n;
    }
    // #endregion

    // #region CURVED GETTERS
    /** Get Cycle with sin applied. Range -1:1*/
    asSin( offset=0 ) : number{ return Math.sin( this.get( offset ) ); }

    /** Get Cycle with sin applied but range remaped to 0:1 */
    asSin01( offset=0 ) : number{ return Math.sin( this.get( offset ) ) * 0.5 + 0.5; }

    /** Get Cycle with sin applied but with absolute value applied. */
    asSinAbs( offset=0 ) : number{ return Math.abs( Math.sin( this.get( offset ) ) ); }

    /** Get Cycle with Sigmoid curved applied. Range 0:1 */
    asSigmoid01( k=0, offset=0 ) : number{ // Over 0, Eases in the middle, under eases in-out
        // this uses the -1 to 1 value of sigmoid which allows to create easing at start and finish.
        // https://dhemery.github.io/DHE-Modules/technical/sigmoid/
        // https://www.desmos.com/calculator/q6ukniiqwn
        const   t = this.asCycleN11( offset ),
                v = ( t - k*t ) / ( k - 2*k*Math.abs(t) + 1 );
        return v * 0.5 + 0.5;
    }

    /** Get Cycle with Sigmoid curved applied. Range 0:1:0 */
    asSigmoid010( k=0, offset=0 ) : number{ // Over 0, Eases in the middle, under eases in-out
        const t = this.asSigmoid01( k, offset ) * 2;
        return ( t > 1 )? 1 - (t - 1) : t;
    }
    // #endregion
}

export default Cycle;