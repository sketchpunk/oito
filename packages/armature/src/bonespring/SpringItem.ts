import { Transform }    from '@oito/core';
import SpringVec3       from './implicit_euler/SpringVec3';

class SpringItem{
    index   : number;
    name    : string;
    spring  = new SpringVec3();
    bind    = new Transform();  // Bind Transform in Local Space

    constructor( name: string, idx: number ){
        this.name   = name;
        this.index  = idx;
    }
}

export default SpringItem;