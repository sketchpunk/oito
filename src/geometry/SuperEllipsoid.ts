import Vec3 from "../Vec3.js";

type TConfig = { r:number, t:number, A:number, B:number, C:number };

class SuperEllipsoid{
    static PietHeinSuperegg( geo : TGeo ) : TGeo{ return this.from( geo, 1, 0.8, 3, 3, 4 ); }

    static from( geo : TGeo, ee=0.5, nn=0.5, A=1, B=1, C=1 ) : TGeo{ // : TGeo
        const v                 = new Vec3();
        const n                 = new Vec3();
        const config : TConfig  = {        // Recomputed Values 
            // Precompute final values of R and T since they will be used for all vertices
            r     : 2 / ( 2 / ee ),  // 2/r >> 2 / ( 2/e )
            t     : 2 / ( 2 / nn ),  // 2/t >> 2 / ( 2/n )

            A     : A,  // Scale Left/Right
            B     : B,  // Scale Foward/Back
            C     : C,  // Scale Up/Down
        }
        
        let theta = 0, phi = 0;
        for( let i = 0; i < geo.vertices.length; i+=3 ){
            v.fromBuf( geo.vertices, i );

            theta   = Math.atan2( Math.sqrt( v[0]**2 + v[1]**2 ), v.z ) + Math.PI * 0.5;
            phi     = Math.atan2( v[1], v[0] );

            this.calcPoint( theta, phi, config, v );
            v.toBuf( geo.vertices, i );

            this.calcNormal( theta, phi, config, n );
            n.toBuf( geo.normals, i );
        }

        return geo;
    }

    //#region Super Ellipsoid Math
    static c( w: number, m: number ): number{
        const cv = Math.cos( w );
        return Math.sign( cv ) * Math.abs( cv ) ** m;
    }

    static s( w: number, m: number ): number{
        const sv = Math.sin( w );
        return Math.sign( sv ) * Math.abs( sv ) ** m;
    }

    static calcPoint( theta: number, phi: number, config: TConfig, v: Vec3 ) : Vec3{
        // https://gist.github.com/spite/7384392c30d50c7ac1d1f504a8a3b40a
        // https://en.wikipedia.org/wiki/Superellipsoid
        // https://en.wikipedia.org/wiki/Superellipsoid#/media/File:Superellipsoid_collection.png
        // Setting r = 2, t = 2.5, A = B = 3, C = 4 one obtains Piet Hein's superegg.
        // which is e = 1, n = 0.8 before R & T us computed.
        // r = 2/e, 
        // t = 2/n,
        // c = ( w, m )=>sign( cos(w) ) * abs( cos(w) )^m
        // s = ( w, m )=>sign( sin(w) ) * abs( sin(w) )^m
        // x = A * c( theta, 2/t ) + c( phi, 2/r )
        // y = B * c( theta, 2/t ) + s( phi, 2/r )
        // z = c * s( theta, 2/t );

        const theta_c_t = this.c( theta, config.t );
        v[ 0 ] = config.A * theta_c_t * this.c( phi, config.r );
        v[ 1 ] = config.C * this.s( theta, config.t );          // Y is up, Original math used Z as UP.
        v[ 2 ] = config.B * theta_c_t * this.s( phi, config.r );
        return v;
    }

    static calcNormal( theta: number, phi: number, config: TConfig, n: Vec3 ) : Vec3{
        const e = 0.00001;
        const a = new Vec3();
        const b = new Vec3();
        const c = new Vec3();
        
        this.calcPoint( theta, phi, config,     a );
        this.calcPoint( theta + e, phi, config, b );
        this.calcPoint( theta, phi+ e, config,  c );

        b.sub( a );
        c.sub( a );
        return n.fromCross( b, c );
    }
    //#endregion 
}

export default SuperEllipsoid;