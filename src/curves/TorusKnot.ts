// https://blackpawn.com/texts/pqtorus/

class TorusKnot{
    // p : winds around its axis of rotational symmetry
    // q : winds around a circle in the interior
    static at( out: TVec3, t: number, p=2, q=5, radius=1 ) : TVec3{

        // https://en.wikipedia.org/wiki/Torus_knot
        // x = r * ( 2 + cos( q/p * x ) ) * 0.5 * cos( x )
        // y = r * ( 2 + cos( q/p * x ) ) * 0.5 * sin( x )
        // z = r * sin( q/p * x ) * 0.5
        const x         = t * p * Math.PI * 2,
              qpx       = q / p * x,
              rh        = radius * 0.5,
              qpx_xy    = rh * (2 + Math.cos( qpx ));
    
        out[ 0 ] = qpx_xy * Math.cos( x );
        out[ 1 ] = qpx_xy * Math.sin( x );
        out[ 2 ] = rh * Math.sin( qpx );
        return out;
    }
    
    // first derivative - tangent of curve
    static dxdy( out: TVec3, t:number, p=2, q=5, radius=1 ) : TVec3{
        // https://www.symbolab.com/solver/derivative-calculator
        // https://www.wolframalpha.com/
        // First Derivative
        // 0.5 * r * ( -sin( x ) * ( 2 + cos( q * x / p ) ) - ( q * sin( q * x / p ) * cos( x ) / p ) )
        // 0.5 * r * ( cos( x ) * ( 2 + cos( q * x / p ) ) - ( q * sin( q * x / p ) * sin( x ) / p ) )
        // r * 0.5 * q * cos( q * x / p ) / p

        const x         = t * p * Math.PI * 2,
              rh        = radius * 0.5,
              pi        = 1 / p,
              qpx       = q * x * pi,
              sin_x     = Math.sin( x ),
              cos_x     = Math.cos( x ),
              sin_qpx   = Math.sin( qpx ),
              cos_qpx   = Math.cos( qpx );

        out[ 0 ] = rh * ( -sin_x * ( 2 + cos_qpx ) - q*sin_qpx*cos_x*pi );
        out[ 1 ] = rh * ( cos_x * ( 2 + cos_qpx ) - q*sin_qpx*sin_x*pi );
        out[ 2 ] = rh * q * cos_qpx * pi ;
        return out;
    }
    
    // second derivative - normal of curve
    static dxdy2( out: TVec3, t:number, p=2, q=5, radius=1 ) : TVec3{
        const x         = t * p * Math.PI * 2,
              rh        = radius * 0.5,
              pq2       = 2 * p * q,
              qxp       = q * x / p,
              pp        = p*p,
              ppi       = 1 / pp,
              qq        = q*q,
              cos_x     = Math.cos( x ),
              sin_x     = Math.sin( x ),
              cos_qxp   = Math.cos( qxp ),
              sin_qxp   = Math.sin( qxp ),
              com       = (pp + qq) * cos_qxp + 2 * pp,
              n_rh_pp   = -rh * ppi;
    
        out[ 0 ] = n_rh_pp * ( cos_x * com - pq2 * sin_x * sin_qxp );
        out[ 1 ] = n_rh_pp * ( sin_x * com + pq2 * cos_x * sin_qxp );
        out[ 2 ] = -0.5 * qq * radius * sin_qxp * ppi;
        return out;
    }

}

export default TorusKnot;