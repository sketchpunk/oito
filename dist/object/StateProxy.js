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
class StateProxy {
    constructor(data) {
        // #endregion ////////////////////////////////////////////////////////////
        // #region MAIN
        this._emitter = new EventTarget();
        this._converters = new Map();
        this._dynamicProperties = false;
        this._data = data;
    }
    // #region STATIC
    static new(data = {}) { return new Proxy(data, new StateProxy(data)); }
    getData() { return this._data; }
    useDynamicProperties(v) { this._dynamicProperties = v; return this; }
    // #endregion ////////////////////////////////////////////////////////////
    // #region PROXY TRAPS
    get(target, prop, receiver) {
        //console.log( "GET", "target", target, "prop", prop, "rec", receiver );    
        if (prop == "$")
            return this;
        return Reflect.get(target, prop, receiver); //target[ prop ];
    }
    set(target, prop, value) {
        //console.log( "SET", "target", target, "prop", prop, "value", value );
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        if (prop == "$")
            return false;
        if (!this._dynamicProperties && !(prop in target))
            return false;
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        if (this._converters.has(prop)) {
            const tuple = this._converters.get(prop)(value);
            if (tuple[0] == false)
                return false;
            value = tuple[1];
        }
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        Reflect.set(target, prop, value); // Save data to Object
        this.emit(prop + "Change", value); // Emit event that property changed
        return true;
    }
    // #endregion ////////////////////////////////////////////////////////////
    // #region CONVERTERS
    /** fn = ( v: any ) : [ boolean, any ] */
    converter(propName, fn) {
        switch (fn) {
            case "float":
                fn = this._floatConverter;
                break;
            case "int":
                fn = this._intConverter;
                break;
        }
        this._converters.set(propName, fn);
        return this;
    }
    _floatConverter(v) {
        v = parseFloat(v);
        return [!isNaN(v), v];
    }
    _intConverter(v) {
        v = parseInt(v);
        return [!isNaN(v), v];
    }
    // #endregion ////////////////////////////////////////////////////////////
    // #region EVENTS
    on(evtName, fn) { this._emitter.addEventListener(evtName, fn); return this; }
    off(evtName, fn) { this._emitter.removeEventListener(evtName, fn); return this; }
    once(evtName, fn) { this._emitter.addEventListener(evtName, fn, { once: true }); return this; }
    emit(evtName, data) {
        this._emitter.dispatchEvent(new CustomEvent(evtName, { detail: data, bubbles: false, cancelable: true, composed: false }));
        return this;
    }
}
export default StateProxy;
