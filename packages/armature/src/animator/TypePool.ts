import { Vec3, Quat } from '@oito/core';

class TypePool{
    static _vec3Pool : Array< Vec3 > = [];
    static _quatPool : Array< Quat > = [];

    static vec3() : Vec3{
        let v: Vec3 | undefined = this._vec3Pool.pop();
        if( !v ) v = new Vec3();
        return v;
    }

    static quat() : Quat{
        let v: Quat | undefined = this._quatPool.pop();
        if( !v ) v = new Quat();
        return v;
    }

    static recycle_vec3( ...ary: Vec3[] ): TypePool{
        let v: Vec3;
        for( v of ary ) this._vec3Pool.push( v.xyz( 0,0,0 ) );
        return this;
    }

    static recycle_quat( ...ary: Quat[] ): TypePool{
        let v: Quat;
        for( v of ary ) this._quatPool.push( v.xyzw( 0,0,0,1 ) );
        return this;
    }
}

export default TypePool;