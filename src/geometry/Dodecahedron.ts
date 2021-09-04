import UniqueVertexGeo  from "./extra/UniqueVertexGeo.js";
import Util             from "./extra/Util.js";

class Dodecahedron {

    static get( div=0, radius=1 ) : TGeo{
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        const t = ( 1 + Math.sqrt( 5 ) ) / 2;
		const r = 1 / t;
        const base: TGeo    = { 
            texcoord    : [],
            normals     : [],
            indices     : [
                3, 11, 7, 	3, 7, 15, 	3, 15, 13,
                7, 19, 17, 	7, 17, 6, 	7, 6, 15,
                17, 4, 8, 	17, 8, 10, 	17, 10, 6,
                8, 0, 16, 	8, 16, 2, 	8, 2, 10,
                0, 12, 1, 	0, 1, 18, 	0, 18, 16,
                6, 10, 2, 	6, 2, 13, 	6, 13, 15,
                2, 16, 18, 	2, 18, 3, 	2, 3, 13,
                18, 1, 9, 	18, 9, 11, 	18, 11, 3,
                4, 14, 12, 	4, 12, 0, 	4, 0, 8,
                11, 9, 5, 	11, 5, 19, 	11, 19, 7,
                19, 5, 14, 	19, 14, 4, 	19, 4, 17,
                1, 12, 14, 	1, 14, 5, 	1, 5, 9 ],
            vertices    : [
                // (±1, ±1, ±1)
                - 1, - 1, - 1,	- 1, - 1, 1,
                - 1, 1, - 1, - 1, 1, 1,
                1, - 1, - 1, 1, - 1, 1,
                1, 1, - 1, 1, 1, 1,

                // (0, ±1/φ, ±φ)
                0, - r, - t, 0, - r, t,
                0, r, - t, 0, r, t,

                // (±1/φ, ±φ, 0)
                - r, - t, 0, - r, t, 0,
                r, - t, 0, r, t, 0,

                // (±φ, 0, ±1/φ)
                - t, 0, - r, t, 0, - r,
                - t, 0, r, t, 0, r
            ],
        };

        if( div == 0 ){
            Util.normalizeScaleVertices( base, radius, true );
            return base;
        }

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        const uvg = new UniqueVertexGeo();
        uvg.subdivGeo( base, div+1 );                           // Sub Divide Basic Shape without creating duplicate vertices
        Util.normalizeScaleVertices( uvg.geo, radius, true );   // Make the shape a sphere & create normals in the process.

        return uvg.geo;
    }

}

export default Dodecahedron;