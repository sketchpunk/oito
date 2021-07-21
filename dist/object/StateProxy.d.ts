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
declare class StateProxy {
    static new(data?: {}): unknown;
    _emitter: EventTarget;
    _converters: Map<any, any>;
    _dynamicProperties: boolean;
    _data: unknown;
    constructor(data: unknown);
    getData(): unknown;
    useDynamicProperties(v: boolean): StateProxy;
    get(target: Record<string, unknown>, prop: string, receiver: any): any;
    set(target: Record<string, unknown>, prop: string, value: any): boolean;
    /** fn = ( v: any ) : [ boolean, any ] */
    converter(propName: string, fn: string | ((v: any) => [boolean, any])): StateProxy;
    _floatConverter(v: any): [boolean, any];
    _intConverter(v: any): [boolean, any];
    on(evtName: string, fn: EventListenerOrEventListenerObject): StateProxy;
    off(evtName: string, fn: EventListenerOrEventListenerObject): StateProxy;
    once(evtName: string, fn: EventListenerOrEventListenerObject): StateProxy;
    emit(evtName: string, data: unknown): StateProxy;
}
export default StateProxy;
