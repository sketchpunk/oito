import type { TVec4, TVec4Struct } from '@oito/types';

class Vec4 extends Float32Array{
    //#region STATIC VALUES
    static BYTESIZE = 4 * Float32Array.BYTES_PER_ELEMENT;
    //#endregion ////////////////////////////////////////////////////////

    //#region CONSTRUCTORS 
    constructor()
    constructor( v: TVec4 )
    constructor( v: number )
    constructor( x: number, y: number, z: number, w: number )
    constructor( v ?: TVec4 | number, y ?: number, z ?: number, w ?: number ){
        super( 4 );
        
        if( v instanceof Vec4 || v instanceof Float32Array || ( v instanceof Array && v.length == 4 )){
            this[ 0 ] = v[ 0 ]; 
            this[ 1 ] = v[ 1 ]; 
            this[ 2 ] = v[ 2 ];
            this[ 3 ] = v[ 3 ];
        }else if( typeof v === "number" && typeof y === "number" && typeof z === "number" && typeof w === "number" ){
            this[ 0 ] = v;
            this[ 1 ] = y; 
            this[ 2 ] = z;
            this[ 3 ] = w;
        }else if( typeof v === "number" ){
            this[ 0 ] = v;
            this[ 1 ] = v;
            this[ 2 ] = v;
            this[ 3 ] = v;
        }
    }
    //#endregion ////////////////////////////////////////////////////////

    //#region SETTERS / GETTERS

    xyzw( x: number, y: number, z: number, w: number ) : Vec4 {
        this[ 0 ] = x;
        this[ 1 ] = y;
        this[ 2 ] = z;
        this[ 3 ] = w;
        return this;
    }

    get x() : number { return this[ 0 ]; }
    set x( v: number ){ this[ 0 ] = v; }

    get y() : number { return this[ 1 ]; }
    set y( v: number ){ this[ 1 ] = v; }

    get z() : number { return this[ 2 ]; }
    set z( v: number ){ this[ 2 ] = v; }

    get w() : number { return this[ 3 ]; }
    set w( v: number ){ this[ 3 ] = v; }

    clone() : Vec4 { return new Vec4( this ); }

    /** Reset all components to zero */
    reset() : Vec4 { 
        this[ 0 ] = 0; 
        this[ 1 ] = 0; 
        this[ 2 ] = 0; 
        this[ 3 ] = 0; 
        return this;
    }

    /** Convert value to a string value */
    toString( rnd = 0 ) : string{
        if( rnd == 0 ) return "[" + this.join(",") + "]";
        else{
            let s = "[";
            for( let i=0; i < 4; i++ ){
                switch( this[i] ){
                    case 0	: s += "0,"; break;
                    case 1	: s += "1,"; break;
                    default	: s += this[ i ].toFixed( rnd ) + ","; break;
                }
            }
            return s.slice(0,-1) + "]";
        }
    }

    //++++++++++++++++++++++++++++++++++
    
    /** Length / Magnitude squared of the vector. Good for quick simple testing */
    get lenSqr() : number{ return this[0]**2 + this[1]**2 + this[2]**2 + this[3]**2; }

    /** Length / Magnitude of the vector */
    len() : number
    /** Set the Length / Magnitude of the vector */
    len( v: number ) : Vec4
    len( v ?: number ) : Vec4 | number {
        if( typeof v == "number" ){
            //this.norm().scale( v );
            return this;
        }
        return Math.sqrt( this[0]**2 + this[1]**2 + this[2]**2 + this[3]**2 );
    }

    //++++++++++++++++++++++++++++++++++

    /** Copy data from a struct vector type. ThreeJS compatilbility */
    fromStruct( v: TVec4Struct ) : Vec4{
        this[ 0 ] = v.x; 
        this[ 1 ] = v.y; 
        this[ 2 ] = v.z;
        this[ 3 ] = v.w;
        return this;
    }

    /** Copy data to a struct vector type. ThreeJS compatilbility */
    toStruct( v: TVec4Struct ) : Vec4 {
        v.x = this[ 0 ];
        v.y = this[ 1 ];
        v.z = this[ 2 ];
        v.w = this[ 3 ];
        return this;
    }

    /** Copy in quaternion data */
    copy( v: TVec4 ) : Vec4 {
        this[ 0 ] = v[ 0 ]; 
        this[ 1 ] = v[ 1 ]; 
        this[ 2 ] = v[ 2 ];
        this[ 3 ] = v[ 3 ]; 
        return this;
    }

    /** Copy data to another quaternion. Good in chaining operations when you want a copy of a quaternion before continuing operations */
    copyTo( v: TVec4 ): Vec4 {
        v[ 0 ] = this[ 0 ];
        v[ 1 ] = this[ 1 ];
        v[ 2 ] = this[ 2 ];
        v[ 3 ] = this[ 3 ];
        return this;
    }

    //++++++++++++++++++++++++++++++++++
    // FLAT BUFFERS

    /** Used to get data from a flat buffer of vectors */
    fromBuf( ary : Array<number> | Float32Array, idx: number ) : Vec4 {
        this[ 0 ] = ary[ idx ];
        this[ 1 ] = ary[ idx + 1 ];
        this[ 2 ] = ary[ idx + 2 ];
        this[ 3 ] = ary[ idx + 3 ];
        return this;
    }

    /** Put data into a flat buffer of vectors */
    toBuf( ary : Array<number> | Float32Array, idx: number ) : Vec4 { 
        ary[ idx ]     = this[ 0 ]; 
        ary[ idx + 1 ] = this[ 1 ]; 
        ary[ idx + 2 ] = this[ 2 ];
        ary[ idx + 3 ] = this[ 3 ];
        return this;
    }

    /** Push quaternion components onto an array */
    pushTo( ary: Array<number> ) : Vec4 {
        ary.push( this[ 0 ], this[ 1 ], this[ 2 ], this[ 3 ] );
        return this;
    }

    //#endregion ////////////////////////////////////////////////////////

    //#region FROM OPERATORS

    /** Add two vectors together */
    fromAdd( a: TVec4, b: TVec4 ) : Vec4{
        this[ 0 ] = a[ 0 ] + b[ 0 ];
        this[ 1 ] = a[ 1 ] + b[ 1 ];
        this[ 2 ] = a[ 2 ] + b[ 2 ];
        this[ 3 ] = a[ 3 ] + b[ 3 ];
        return this;
    }

    /** Subtract two vectors together */
    fromSub( a: TVec4, b: TVec4 ) : Vec4{
        this[ 0 ] = a[ 0 ] - b[ 0 ];
        this[ 1 ] = a[ 1 ] - b[ 1 ];
        this[ 2 ] = a[ 2 ] - b[ 2 ];
        this[ 3 ] = a[ 3 ] - b[ 3 ];
        return this;
    }

    /** Multiply two vectors together */
    fromMul( a: TVec4, b: TVec4 ) : Vec4{
        this[ 0 ] = a[ 0 ] * b[ 0 ];
        this[ 1 ] = a[ 1 ] * b[ 1 ];
        this[ 2 ] = a[ 2 ] * b[ 2 ];
        this[ 3 ] = a[ 3 ] * b[ 3 ];
        return this;
    }

    /** Divide two vectors together */
    fromDiv( a: TVec4, b: TVec4 ) : Vec4{
        this[ 0 ] = ( b[ 0 ] != 0 )? a[ 0 ] / b[ 0 ] : 0;
        this[ 1 ] = ( b[ 1 ] != 0 )? a[ 1 ] / b[ 1 ] : 0;
        this[ 2 ] = ( b[ 2 ] != 0 )? a[ 2 ] / b[ 2 ] : 0;
        this[ 3 ] = ( b[ 3 ] != 0 )? a[ 3 ] / b[ 3 ] : 0;
        return this;
    }

    /** Scale a vector */
    fromScale( a: TVec4, s: number ) : Vec4{
        this[ 0 ] = a[ 0 ] * s;
        this[ 1 ] = a[ 1 ] * s;
        this[ 2 ] = a[ 2 ] * s;
        this[ 3 ] = a[ 3 ] * s;
        return this;
    }

    /** Divide vector by a scalar value */
    fromDivScale( a: TVec4, s: number ) : Vec4{
        if( s != 0 ){
            this[ 0 ] = a[ 0 ] / s;
            this[ 1 ] = a[ 1 ] / s;
            this[ 2 ] = a[ 2 ] / s;
            this[ 3 ] = a[ 3 ] / s;
        }
        return this;
    }


    //++++++++++++++++++++++++++++++++++
    // Complex Operators
    
    fromNorm( v: TVec4 ) : Vec4 {
        let mag = Math.sqrt( v[ 0 ]**2 + v[ 1 ]**2 + v[ 2 ]**2 + v[ 3 ]**2 );
        if( mag == 0 ) return this;

        mag = 1 / mag;
        this[ 0 ] = v[ 0 ] * mag;
        this[ 1 ] = v[ 1 ] * mag;
        this[ 2 ] = v[ 2 ] * mag;
        this[ 3 ] = v[ 3 ] * mag;
        return this;
    }

    fromNegate( a: TVec4 ) : Vec4 {
        this[ 0 ] = -a[ 0 ]; 
        this[ 1 ] = -a[ 1 ];
        this[ 2 ] = -a[ 2 ];
        this[ 3 ] = -a[ 3 ];
        return this;
    }

    //#endregion ////////////////////////////////////////////////////////

    //#region OPERATORS

    /** Add vector to current vector */
    add( a: TVec4 ) : Vec4{
        this[ 0 ] += a[ 0 ];
        this[ 1 ] += a[ 1 ];
        this[ 2 ] += a[ 2 ];
        this[ 3 ] += a[ 3 ];
        return this;
    }

    sub( v: TVec4 ) : Vec4{
        this[ 0 ] -= v[ 0 ];
        this[ 1 ] -= v[ 1 ];
        this[ 2 ] -= v[ 2 ];
        this[ 3 ] -= v[ 3 ];
        return this;
    }

    mul( v: TVec4 ) : Vec4{
        this[ 0 ] *= v[ 0 ];
        this[ 1 ] *= v[ 1 ];
        this[ 2 ] *= v[ 2 ];
        this[ 3 ] *= v[ 3 ];
        return this;
    }

    div( v: TVec4 ) : Vec4{
        this[ 0 ] = ( v[ 0 ] != 0 )? this[ 0 ] / v[ 0 ] : 0;
        this[ 1 ] = ( v[ 1 ] != 0 )? this[ 1 ] / v[ 1 ] : 0;
        this[ 2 ] = ( v[ 2 ] != 0 )? this[ 2 ] / v[ 2 ] : 0;
        this[ 3 ] = ( v[ 3 ] != 0 )? this[ 3 ] / v[ 3 ] : 0;
        return this;
    }

    divScale( v: number ) : Vec4{
        if( v != 0 ){
            this[ 0 ] /= v;
            this[ 1 ] /= v;
            this[ 2 ] /= v;
            this[ 3 ] /= v;
        }else{
            this[ 0 ] = 0;
            this[ 1 ] = 0;
            this[ 2 ] = 0;
            this[ 3 ] = 0;
        }
        return this;
    }

    preDivScale( v: number ) : Vec4{
        this[ 0 ] = ( this[ 0 ] != 0 )? v / this[ 0 ] : 0;
        this[ 1 ] = ( this[ 1 ] != 0 )? v / this[ 1 ] : 0;
        this[ 2 ] = ( this[ 2 ] != 0 )? v / this[ 2 ] : 0;
        this[ 3 ] = ( this[ 3 ] != 0 )? v / this[ 3 ] : 0;
        return this;
    }	

    scale( v: number ) : Vec4{
        this[ 0 ] *= v;
        this[ 1 ] *= v;
        this[ 2 ] *= v;
        this[ 3 ] *= v;
        return this;
    }

    //++++++++++++++++++++++++++++++++++

    abs() : Vec4{ 
        this[ 0 ] = Math.abs( this[ 0 ] );
        this[ 1 ] = Math.abs( this[ 1 ] );
        this[ 2 ] = Math.abs( this[ 2 ] );
        this[ 3 ] = Math.abs( this[ 3 ] );
        return this;
    }

    floor() : Vec4{
        this[ 0 ] = Math.floor( this[ 0 ] );
        this[ 1 ] = Math.floor( this[ 1 ] );
        this[ 2 ] = Math.floor( this[ 2 ] );
        this[ 3 ] = Math.floor( this[ 3 ] );
        return this;
    }

    ceil() : Vec4{
        this[ 0 ] = Math.ceil( this[ 0 ] );
        this[ 1 ] = Math.ceil( this[ 1 ] );
        this[ 2 ] = Math.ceil( this[ 2 ] );
        this[ 3 ] = Math.ceil( this[ 3 ] );
        return this;
    }

    /** When values are very small, like less then 0.000001, just make it zero */
    nearZero() : Vec4{
        if( Math.abs( this[ 0 ] ) <= 1e-6 ) this[ 0 ] = 0;
        if( Math.abs( this[ 1 ] ) <= 1e-6 ) this[ 1 ] = 0;
        if( Math.abs( this[ 2 ] ) <= 1e-6 ) this[ 2 ] = 0;
        if( Math.abs( this[ 3 ] ) <= 1e-6 ) this[ 3 ] = 0;
        return this;
    }

    negate() : Vec4{
        this[ 0 ] = -this[ 0 ];
        this[ 1 ] = -this[ 1 ];
        this[ 2 ] = -this[ 2 ];
        this[ 3 ] = -this[ 3 ];
        return this;
    }

    norm() : Vec4{
        let mag = Math.sqrt( this[0]**2 + this[1]**2 + this[2]**2 + this[3]**2 );
        if( mag != 0 ){
            mag      = 1 / mag;
            this[ 0 ] *= mag;
            this[ 1 ] *= mag;
            this[ 2 ] *= mag;
            this[ 3 ] *= mag;
        }
        return this;
    }

    clamp( min: TVec4, max: TVec4 ) : Vec4{
        this[ 0 ] = Math.min( Math.max( this[ 0 ], min[ 0 ] ), max[ 0 ] );
        this[ 1 ] = Math.min( Math.max( this[ 1 ], min[ 1 ] ), max[ 1 ] );
        this[ 2 ] = Math.min( Math.max( this[ 2 ], min[ 2 ] ), max[ 2 ] );
        this[ 3 ] = Math.min( Math.max( this[ 3 ], min[ 3 ] ), max[ 3 ] );
        return this;
    }

    snap( v: TVec4 ) : Vec4 {
        this[ 0 ] = ( v[ 0 ] != 0 )? Math.floor( this[ 0 ] / v[ 0 ] ) * v[ 0 ] : 0;
        this[ 1 ] = ( v[ 1 ] != 0 )? Math.floor( this[ 1 ] / v[ 1 ] ) * v[ 1 ] : 0;
        this[ 2 ] = ( v[ 2 ] != 0 )? Math.floor( this[ 2 ] / v[ 2 ] ) * v[ 2 ] : 0;
        this[ 3 ] = ( v[ 3 ] != 0 )? Math.floor( this[ 3 ] / v[ 3 ] ) * v[ 3 ] : 0;
        return this;
    }

    //#endregion ////////////////////////////////////////////////////////


}

export default Vec4;