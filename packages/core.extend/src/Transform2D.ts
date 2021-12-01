
import type { TVec2, TVec3, TVec4 } from '@oito/types';
import { Vec2 }                     from '@oito/core';

class Transform2D{
    //#region MAIN

    /** Rotation in Radians */
    rot	= 0;
    /** Vector2 Position */
    pos	= new Vec2();
    /** Vector2 Scale */
    scl = new Vec2( 1, 1 );

    constructor()
    constructor( tran: Transform2D )
    constructor( rot: TVec4, pos: TVec3, scl: TVec3 )
    constructor( rot ?: TVec4 | Transform2D, pos ?: TVec3, scl ?: TVec3 ){
        if( rot instanceof Transform2D ){
            this.copy( rot );
        }else if( typeof rot === 'number' && pos && scl ){
            this.set( rot, pos, scl );
        }
    }
    //#endregion ////////////////////////////////////////////////////////


    //#region SETTERS / GETTERS

    reset() : this{
        this.rot = 0;
        this.pos.xy( 0, 0 );
        this.scl.xy( 1, 1 );
        return this;
    }

    copy( t: Transform2D ) : this{
        this.rot = t.rot;
        this.pos.copy( t.pos );
        this.scl.copy( t.scl );
        return this;
    }

    set( r ?: number, p ?: TVec2, s ?: TVec2 ) : this{
        if( r != undefined && r != null)    this.rot = r;
        if( p )                             this.pos.copy( p );
        if( s )	                            this.scl.copy( s );
        return this;
    }

    getDeg(): number{ return this.rot * 180 / Math.PI; }
    setDeg( d: number ): this{ this.rot = d * Math.PI / 180; return this; }
    setScl( s: number ): this{ this.scl.xy( s ); return this; }
    setPos( x: number, y:number ): this{ this.pos.xy( x, y ); return this; }

    clone() : Transform2D{ return new Transform2D( this ); }

    //#endregion ////////////////////////////////////////////////////////

    //#region FROM OPS
    fromInvert( t: Transform2D ) : this{
        // Invert Rotation
        this.rot = -t.rot;

        // Invert Scale
        this.scl.fromInvert( t.scl ); // 1 / value

        // Invert Position : rotInv * ( invScl * -Pos )
        this.pos
            .fromNegate( t.pos )
            .mul( this.scl )
            .rotate( this.rot );

        return this;
    }
    //#endregion ////////////////////////////////////////////////////////

    //#region TRANSFORMATION
    transformVec2( v: Vec2, out ?: Vec2 ) : Vec2{
        //GLSL - vecQuatRotation(model.rotation, a_position.xyz * model.scale) + model.position;
        return ( out || v )
            .fromMul( v, this.scl )
            .rotate( this.rot )
            .add( this.pos );
    }
    //#endregion ////////////////////////////////////////////////////////

    //#region STATIC
    static invert( t: Transform2D ) : Transform2D{ return new Transform2D().fromInvert( t ); }
    //#endregion ////////////////////////////////////////////////////////
}

export default Transform2D;