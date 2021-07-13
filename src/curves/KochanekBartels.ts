class KochanekBartels{
    static at( p0: TVec3, p1: TVec3, p2: TVec3, p3: TVec3, tension: number, continuity: number, bias: number, t: number, out ?: TVec3 ) : TVec3{
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // OPTIMIZATION NOTES :
        // If interpolating a curve, TCB and Tangents shouldn't be calc for each point.
        // Precalc then reuse values for each t of the curve.
        // FOR splines, d0a, d0b, d1a, d1b Can be calced for all curves, then just do the tangents per curve.
        const d0a = ((1 - tension) * ( 1 + bias ) * (1 + continuity)) * 0.5,
              d0b = ((1 - tension) * ( 1 - bias ) * (1 - continuity)) * 0.5,
              d1a = ((1 - tension) * ( 1 + bias ) * (1 - continuity)) * 0.5,
              d1b = ((1 - tension) * ( 1 - bias ) * (1 + continuity)) * 0.5,

              d0x = d0a * ( p1[0] - p0[0] ) + d0b * ( p2[0] - p1[0] ),	// Incoming Tangent
              d0y = d0a * ( p1[1] - p0[1] ) + d0b * ( p2[1] - p1[1] ),
              d0z = d0a * ( p1[2] - p0[2] ) + d0b * ( p2[2] - p1[2] ),

              d1x = d1a * ( p2[0] - p1[0] ) + d1b * ( p3[0] - p2[0] ),	// Outgoing Tangent
              d1y = d1a * ( p2[1] - p1[1] ) + d1b * ( p3[1] - p2[1] ),
              d1z = d1a * ( p2[2] - p1[2] ) + d1b * ( p3[2] - p2[2] );

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Interpolate a point on the curve
        const tt  = t * t,
              ttt = tt * t;

        out    ??= [ 0, 0, 0 ];
        out[ 0 ] = p1[0] + d0x * t + (- 3 * p1[0] + 3 * p2[0] - 2 * d0x - d1x) * tt + ( 2 * p1[0] - 2 * p2[0] + d0x + d1x) * ttt;
        out[ 1 ] = p1[1] + d0y * t + (- 3 * p1[1] + 3 * p2[1] - 2 * d0y - d1y) * tt + ( 2 * p1[1] - 2 * p2[1] + d0y + d1y) * ttt;
        out[ 2 ] = p1[2] + d0z * t + (- 3 * p1[2] + 3 * p2[2] - 2 * d0z - d1z) * tt + ( 2 * p1[2] - 2 * p2[2] + d0z + d1z) * ttt;
        return out;
    }

    static dxdy( p0: TVec3, p1: TVec3, p2: TVec3, p3: TVec3, tension: number, continuity: number, bias: number, t: number, out ?: TVec3 ) : TVec3{
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // OPTIMIZATION NOTES :
        // If interpolating a curve, TCB and Tangents shouldn't be calc for each point.
        // Precalc then reuse values for each t of the curve.
        // FOR splines, d0a, d0b, d1a, d1b Can be calced for all curves, then just do the tangents per curve.
        const d0a = ((1 - tension) * ( 1 + bias ) * (1 + continuity)) * 0.5,
              d0b = ((1 - tension) * ( 1 - bias ) * (1 - continuity)) * 0.5,
              d1a = ((1 - tension) * ( 1 + bias ) * (1 - continuity)) * 0.5,
              d1b = ((1 - tension) * ( 1 - bias ) * (1 + continuity)) * 0.5,

              d0x = d0a * ( p1[0] - p0[0] ) + d0b * ( p2[0] - p1[0]),	// Incoming Tangent
              d0y = d0a * ( p1.y - p0.y ) + d0b * ( p2.y - p1.y ),
              d0z = d0a * ( p1.z - p0.z ) + d0b * ( p2.z - p1.z ),

              d1x = d1a * ( p2[0] - p1[0] ) + d1b * ( p3[0] - p2[0] ),	// Outgoing Tangent
              d1y = d1a * ( p2[1] - p1[1] ) + d1b * ( p3[1] - p2[1] ),
              d1z = d1a * ( p2[2] - p1[2] ) + d1b * ( p3[2] - p2[2] );

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Interpolate a point on the curve
        const tt  = t * t;

        out    ??= [ 0, 0, 0 ];
        out[ 0 ] = d0x + (- 3 * p1[0] + 3 * p2[0] - 2 * d0x - d1x) * 2 * t + ( 2 * p1[0] - 2 * p2[0] + d0x + d1x) * 3 * tt;
        out[ 1 ] = d0y + (- 3 * p1[1] + 3 * p2[1] - 2 * d0y - d1y) * 2 * t + ( 2 * p1[1] - 2 * p2[1] + d0y + d1y) * 3 * tt;
        out[ 2 ] = d0z + (- 3 * p1[2] + 3 * p2[2] - 2 * d0z - d1z) * 2 * t + ( 2 * p1[2] - 2 * p2[2] + d0z + d1z) * 3 * tt;
        return out;
    }
}

export default KochanekBartels;