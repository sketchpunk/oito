
class Segment{
    static nearestFromPoint( a: TVec3, b: TVec3, p: TVec3, out ?: TVec3 ) : TVec3 {
        const dx    = b[0] - a[0],
              dy    = b[1] - a[1],
              dz    = b[2] - a[2],
              t     = ( (p[0]-a[0])*dx + (p[1]-a[1])*dy + (p[2]-a[2])*dz ) / ( dx*dx + dy*dy + dz*dz ),
              ti    = 1 - t;
    
        out = out || [ 0,0,0 ];
        out[ 0 ] = a[0] * ti + b[0] * t;
        out[ 1 ] = a[1] * ti + b[1] * t;
        out[ 2 ] = a[2] * ti + b[2] * t;
        return out;
    }
}

export default Segment;