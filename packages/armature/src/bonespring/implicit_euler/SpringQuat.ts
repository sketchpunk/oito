import { Quat }         from '@oito/core'
import type { TVec4 }   from '@oito/types'
import SpringBase       from './SpringBase';

// implicit euler spring
class SpringQuat extends SpringBase {
    // #region MAIN
    vel     = new Quat(); // Velocity
    val     = new Quat(); // Current Value
    tar     = new Quat(); // Target Value
    epsilon = 0.00001;
    // #endregion ///////////////////////////////////////////////////////////////////

    //#region SETTERS / GETTERS
    setTarget( v: TVec4, doNorm=false ): this{
        this.tar.copy( v );
        if( doNorm ) this.tar.norm();
        return this;
    }

    reset( v ?: TVec4 ){
        this.vel.xyzw( 0, 0, 0, 1 );

        if( v ){
            this.val.copy( v );
            this.tar.copy( v );
        }else{
            this.val.xyzw( 0, 0, 0, 1 );
            this.tar.xyzw( 0, 0, 0, 1 );
        }

        return this;
    }
    //#endregion ///////////////////////////////////////////////////////////////////

    update( dt: number ): boolean{
        if( this.vel.isZero() && Quat.lenSqr( this.tar, this.val ) == 0 ) return false;

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        if ( this.vel.lenSqr() < this.epsilon && Quat.lenSqr( this.tar, this.val ) < this.epsilon ) {
            this.vel.xyzw( 0, 0, 0, 0 );
            this.val.copy( this.tar );
            return true;
        }

        if( Quat.dot( this.tar, this.val ) < 0 ) this.tar.negate(); // Can screw up skinning if axis not in same hemisphere
        
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        let friction = 1.0 + 2.0 * dt * this.damping * this.oscPerSec,
            dt_osc	 = dt * this.oscPerSec**2,
            dt2_osc  = dt * dt_osc,
            det_inv  = 1.0 / ( friction + dt2_osc );

        this.vel[0] = ( this.vel[0] + dt_osc * ( this.tar[0] - this.val[0] ) ) * det_inv;
        this.vel[1] = ( this.vel[1] + dt_osc * ( this.tar[1] - this.val[1] ) ) * det_inv;
        this.vel[2] = ( this.vel[2] + dt_osc * ( this.tar[2] - this.val[2] ) ) * det_inv;
        this.vel[3] = ( this.vel[3] + dt_osc * ( this.tar[3] - this.val[3] ) ) * det_inv;

        this.val[0] = ( friction * this.val[0] + dt * this.vel[0] + dt2_osc * this.tar[0] ) * det_inv;
        this.val[1] = ( friction * this.val[1] + dt * this.vel[1] + dt2_osc * this.tar[1] ) * det_inv;
        this.val[2] = ( friction * this.val[2] + dt * this.vel[2] + dt2_osc * this.tar[2] ) * det_inv;
        this.val[3] = ( friction * this.val[3] + dt * this.vel[3] + dt2_osc * this.tar[3] ) * det_inv;

        this.val.norm();
        return true;
    }
}

export default SpringQuat;