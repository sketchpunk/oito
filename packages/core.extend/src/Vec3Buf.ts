import type { TVec3, TVec3Struct } from "@oito/types";

type TNumAry = number[] | Float32Array;

class Vec3Buf{

    //#region MAIN
    _buf    !: TNumAry; // Buffer Being Accessed
    _xi     = -1;       // Component Index
    _yi     = -1;
    _zi     = -1;
    _v : number[] = [ 0, 0, 0 ];
    
    constructor( buf: TNumAry ){ this._buf = buf; }
    //#endregion


    //#region MAIN OBJECT

    get count(): number{ return this._buf.length / 3; }

    get x(): number{ return this._buf[ this._xi ]; }
    get y(): number{ return this._buf[ this._yi ]; }
    get z(): number{ return this._buf[ this._zi ]; }
    
    set x( v: number ){ this._buf[ this._xi ] = v; }
    set y( v: number ){ this._buf[ this._yi ] = v; }
    set z( v: number ){ this._buf[ this._zi ] = v; }

    //-----------------------------

    at( i: number ): this{
        i *= 3;
        if( i > this._buf.length ){
            console.error( 'Vec3Buf.at : Index is more then the buffer has' );
            return this;
        }

        this._xi = i;
        this._yi = i + 1;
        this._zi = i + 2;
        return this;
    }

    set( x: number ): this // Single Number set is good for Scale Vectors
    set( x: number, y: number, z: number ): this
    set( x: number, y?: number, z?: number ): this {
        if( y != undefined && z != undefined ){
            this._buf[ this._xi ] = x;
            this._buf[ this._yi ] = y;
            this._buf[ this._zi ] = z;
        } else{
            this._buf[ this._xi ] = x;
            this._buf[ this._yi ] = x;
            this._buf[ this._zi ] = x;
        }
        return this;
    }

    get( out ?: TVec3 ): TVec3{
        if( !out ) return [ this._buf[ this._xi ], this._buf[ this._yi ], this._buf[ this._zi ] ];        
        
        out    ??= this._v;
        out[ 0 ] = this._buf[ this._xi ];
        out[ 1 ] = this._buf[ this._yi ];
        out[ 2 ] = this._buf[ this._zi ];
        return out
    }

    setBuffer( buf: TNumAry ): this{
        this._buf = buf; 
        this._xi  = -1;
        this._yi  = -1;
        this._zi  = -1;
        return this;
    }

    push( v: number, y: number, z:number ): this
    push( v: number | TVec3, y ?: number, z ?: number ): this{
        if( this._buf instanceof Float32Array ){
            console.log( "Buffer is a TypeArray, Can not push a vec3" );
            return this;
        }

        if( v instanceof Array ){
            this._buf.push( v[0], v[1], v[2] );
        }else if( typeof v == 'number' && y != undefined && z != undefined ){
            this._buf.push( v, y, z );
        }

        return this;
    }

    //-----------------------------

    toFloatArray(): Float32Array{
        return ( this._buf instanceof Float32Array )?
            this._buf :
            new Float32Array( this._buf );
    }

    clear(): this{
        if( this._buf instanceof Float32Array ){
            console.error( 'Can not clear a float32Array' );
            return this;
        }

        this._buf.length = 0;
        return this
    }

    //#endregion


    //#region GETTERS - SETTERS

    len( i ?: number ) : number{
        if( i != undefined ) this.at( i );
        return Math.sqrt(
            this._buf[ this._xi ] ** 2 + 
            this._buf[ this._yi ] ** 2 +
            this._buf[ this._zi ] ** 2
        );
    }

    lenSq( i ?: number ) : number{
        if( i != undefined ) this.at( i );
        return  this._buf[ this._xi ] ** 2 + 
                this._buf[ this._yi ] ** 2 +
                this._buf[ this._zi ] ** 2 ;
    }

    //-----------------------------

    /** Copy data from a struct vector type. ThreeJS compatilbility */
    fromStruct( v: TVec3Struct ): this{
        this._buf[ this._xi ] = v.x;
        this._buf[ this._yi ] = v.y;
        this._buf[ this._zi ] = v.z;
        return this;
    }

    /** Copy data to a struct vector type. ThreeJS compatilbility */
    toStruct( v: TVec3Struct ): this{
        v.x = this._buf[ this._xi ];
        v.y = this._buf[ this._yi ];
        v.z = this._buf[ this._zi ];
        return this;
    }

    //#endregion


    //#region OPERATORS

    add( a: TVec3 ): this{
        this._buf[ this._xi ] += a[ 0 ];
        this._buf[ this._yi ] += a[ 1 ];
        this._buf[ this._zi ] += a[ 2 ];
        return this;
    }

    fromAdd( a: TVec3 , b: TVec3  ): this{
        this._buf[ this._xi ] = a[ 0 ] + b[ 0 ];
        this._buf[ this._yi ] = a[ 0 ] + b[ 1 ];
        this._buf[ this._zi ] = a[ 2 ] + b[ 2 ];
        return this;
    }

    sub( a: TVec3 ): this{
        this._buf[ this._xi ] -= a[ 0 ];
        this._buf[ this._yi ] -= a[ 1 ];
        this._buf[ this._zi ] -= a[ 2 ];
        return this;
    }

    fromSub( a: TVec3 , b: TVec3  ): this{
        this._buf[ this._xi ] = a[ 0 ] - b[ 0 ];
        this._buf[ this._yi ] = a[ 0 ] - b[ 1 ];
        this._buf[ this._zi ] = a[ 2 ] - b[ 2 ];
        return this;
    }

    //#endregion


    //#region VEC OPERATIONS

    norm() : this{
        let mag = Math.sqrt( 
            this._buf[ this._xi ] ** 2 + 
            this._buf[ this._yi ] ** 2 +
            this._buf[ this._zi ] ** 2
        );

        if( mag != 0 ){
            mag      = 1 / mag;
            this._buf[ this._xi ] *= mag;
            this._buf[ this._yi ] *= mag;
            this._buf[ this._zi ] *= mag;
        }
        return this;
    }

    fromNorm( v: TVec3 ): this {
        let mag = Math.sqrt( v[ 0 ]**2 + v[ 1 ]**2 + v[ 2 ]**2 );
        if( mag == 0 ) return this;

        mag = 1 / mag;
        this._buf[ this._xi ] = v[ 0 ] * mag;
        this._buf[ this._yi ] = v[ 1 ] * mag;
        this._buf[ this._zi ] = v[ 2 ] * mag;
        return this;
    }

    //#endregion


    //#region BUFFER WIDE OPERATIONS

    centroid( out ?: TVec3 ): TVec3{
        let i : number;
        let x : number = 0;
        let y : number = 0;
        let z : number = 0;

        for( i=0; i < this._buf.length; i+=3 ){
            x += this._buf[ i ];
            y += this._buf[ i+1 ];
            z += this._buf[ i+2 ];
        }

        const cnt = 1 / ( this._buf.length / 3 );
        out    ??= [ 0, 0, 0 ];
        out[ 0 ] = x * cnt;
        out[ 1 ] = y * cnt;
        out[ 2 ] = z * cnt;
        return out;
    }

    bounds(): [ number[], number[] ]{
        let i : number;
        let x : number;
        let y : number;
        let z : number;
        const min = [ Infinity, Infinity, Infinity ];
        const max = [ -Infinity, -Infinity, -Infinity ];

        for( i=0; i < this._buf.length; i+=3 ){
            x = this._buf[ i ];
            y = this._buf[ i+1 ];
            z = this._buf[ i+2 ];

            if( x < min[ 0 ] ) min[ 0 ] = x;
            if( y < min[ 1 ] ) min[ 1 ] = y;
            if( z < min[ 2 ] ) min[ 2 ] = z;

            if( x > max[ 0 ] ) max[ 0 ] = x;
            if( y > max[ 1 ] ) max[ 1 ] = y;
            if( z > max[ 2 ] ) max[ 2 ] = z;
        }

        return [ min, max ];
    }

    //#endregion
}

export default Vec3Buf;