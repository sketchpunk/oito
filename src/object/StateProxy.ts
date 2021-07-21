/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */

/**
@example
let myData = { woot:0 };

let state = StateProxy.new( myData );
state.$
    .useDynamicProperties( false )
    .converter( "woot", "int" )
    .on( "wootChange", (e)=>{ console.log( "wootChange", e.detail ) } );

state.woot = "500.5";   // Converter will change data to int( 500 )
state.woot = "yo";      // Converter Prevents this from being Saved since it produces NaN value

console.log( state.woot );
*/

class StateProxy{

    // #region STATIC
    static new( data={} ):unknown { return new Proxy( data, new StateProxy( data ) ); }
    // #endregion ////////////////////////////////////////////////////////////

    // #region MAIN
    _emitter           = new EventTarget();
    _converters        = new Map();
    _dynamicProperties = false;
    _data              : unknown;
    
    constructor( data: unknown ){
        this._data = data;
    }

    getData(): unknown{ return this._data; }
    useDynamicProperties( v: boolean ) : StateProxy{ this._dynamicProperties = v; return this; }

    // #endregion ////////////////////////////////////////////////////////////

    // #region PROXY TRAPS
    get( target: Record<string, unknown>, prop: string, receiver: any ) : any {
        //console.log( "GET", "target", target, "prop", prop, "rec", receiver );    
        if( prop == "$" ) return this;
    
        return Reflect.get( target, prop, receiver ); //target[ prop ];
    }

    set( target: Record<string, unknown>, prop: string, value: any ) : boolean {
        //console.log( "SET", "target", target, "prop", prop, "value", value );

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        if( prop == "$" )                                    return false;
        if( !this._dynamicProperties && !( prop in target ) ) return false;

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        if( this._converters.has( prop ) ){
            const tuple = this._converters.get( prop )( value );
            if( tuple[ 0 ] == false ) return false;
            value = tuple[ 1 ];
        }

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Reflect.set( target, prop, value ); // Save data to Object
        this.emit( prop+"Change", value );  // Emit event that property changed
        return true;
    }
    // #endregion ////////////////////////////////////////////////////////////

    // #region CONVERTERS
    /** fn = ( v: any ) : [ boolean, any ] */
    converter( propName: string, fn: string | ((v: any)=>[ boolean, any ])  ) : StateProxy{
        switch( fn ){
            case "float"    : fn = this._floatConverter;   break;
            case "int"      : fn = this._intConverter;     break;
        }

        this._converters.set( propName, fn );
        return this;
    }

    _floatConverter( v: any ) : [ boolean, any ] {
        v = parseFloat( v );
        return [ !isNaN( v ), v ];
    }

    _intConverter( v: any ) : [ boolean, any ] {
        v = parseInt( v );
        return [ !isNaN( v ), v ];
    }
    // #endregion ////////////////////////////////////////////////////////////

    // #region EVENTS
    on( evtName: string, fn: EventListenerOrEventListenerObject ) : StateProxy{ this._emitter.addEventListener( evtName, fn ); return this; }
    off( evtName: string, fn: EventListenerOrEventListenerObject ) : StateProxy{ this._emitter.removeEventListener( evtName, fn ); return this; }
    once( evtName: string, fn: EventListenerOrEventListenerObject ) : StateProxy{ this._emitter.addEventListener( evtName, fn, { once:true } ); return this; }

    emit( evtName: string, data: unknown ) : StateProxy{
        this._emitter.dispatchEvent( new CustomEvent( evtName, { detail:data, bubbles: false, cancelable:true, composed:false } ) );
        return this;
    }
    // #endregion ////////////////////////////////////////////////////////////

}

export default StateProxy;