import UniqueVertexGeo  from "./extra/UniqueVertexGeo.js";
import Util             from "./extra/Util.js";

class Octahedron{

    static get( div=0, radius=1 ) : TGeo{
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        const t             = ( 1 + Math.sqrt( 5 ) ) / 2;
        const base: TGeo    = { 
            texcoord    : [],
            normals     : [],
            indices     : [
                0, 2, 4,	0, 4, 3,	0, 3, 5,
                0, 5, 2,	1, 2, 5,	1, 5, 3,
                1, 3, 4,	1, 4, 2 ],
            vertices    : [
                1, 0, 0, 	- 1, 0, 0,	0, 1, 0,
                0, - 1, 0, 	0, 0, 1,	0, 0, - 1
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

export default Octahedron;