import { Vec3 }         from '@oito/core'
import type { TVec3 }   from '@oito/types'
import SpringBase       from './SpringBase';

// implicit euler spring
class SpringVec3 extends SpringBase {
    //#region MAIN
    vel     = new Vec3(); // Velocity
    val     = new Vec3(); // Current Value
    tar     = new Vec3(); // Target Value
    epsilon = 0.000001;
    //#endregion ///////////////////////////////////////////////////////////////////

    // #region SETTERS / GETTERS
    setTarget( v: TVec3 ){ this.tar.copy( v ); return this; }

    reset( v: TVec3 ){
        this.vel.xyz( 0, 0, 0 );

        if( v ){
            this.val.copy( v );
            this.tar.copy( v );
        }else{
            this.val.xyz( 0, 0, 0 );
            this.tar.xyz( 0, 0, 0 );
        }

        return this;
    }
    //#endregion ///////////////////////////////////////////////////////////////////

    update( dt: number ): boolean{
        if( this.vel.isZero() && Vec3.lenSqr( this.tar, this.val ) == 0 ) return false;

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        if ( this.vel.lenSqr() < this.epsilon && Vec3.lenSqr( this.tar, this.val ) < this.epsilon ) {
            this.vel.xyz( 0, 0, 0 );
            this.val.copy( this.tar );
            return true;
        }
        
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        let friction = 1.0 + 2.0 * dt * this.damping * this.oscPerSec,
            dt_osc	 = dt * this.oscPerSec**2,
            dt2_osc  = dt * dt_osc,
            det_inv  = 1.0 / ( friction + dt2_osc );

        this.vel[0] = ( this.vel[0] + dt_osc * ( this.tar[0] - this.val[0] ) ) * det_inv;
        this.vel[1] = ( this.vel[1] + dt_osc * ( this.tar[1] - this.val[1] ) ) * det_inv;
        this.vel[2] = ( this.vel[2] + dt_osc * ( this.tar[2] - this.val[2] ) ) * det_inv;

        this.val[0] = ( friction * this.val[0] + dt * this.vel[0] + dt2_osc * this.tar[0] ) * det_inv;
        this.val[1] = ( friction * this.val[1] + dt * this.vel[1] + dt2_osc * this.tar[1] ) * det_inv;
        this.val[2] = ( friction * this.val[2] + dt * this.vel[2] + dt2_osc * this.tar[2] ) * det_inv;

        return true;
    }
}

export default SpringVec3;