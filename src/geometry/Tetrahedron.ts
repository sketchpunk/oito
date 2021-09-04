import UniqueVertexGeo  from "./extra/UniqueVertexGeo.js";
import Util             from "./extra/Util.js";

class Tetrahedron {

    static get( div=0, radius=1 ) : TGeo{
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        const base: TGeo    = { 
            texcoord    : [],
            normals     : [],
            indices     : [ 2,1,0,  0,3,2,  1,3,0,  2,3,1 ],
            vertices    : [ 1,1,1,  -1,-1,1,  -1,1,-1,  1,-1,-1 ],
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

export default Tetrahedron;