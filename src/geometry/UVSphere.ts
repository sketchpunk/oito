import Maths from "../Maths.js";
import Util  from "./extra/Util.js";

class UVSphere{

    static get( radius=0.5, latSteps=10, lngSteps=10 ) : TGeo{
        let s_lat, c_lat, s_lng, c_lng, x, y, z, i, j, len, tj, ti;
        let lon        = 0;
        let lat        = 0; 
        const latRng   = Maths.PI_2; //Maths.PI_H;
        const lngRng   = Math.PI; // Maths.PI_H;

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        const rtn :TGeo = {
            vertices    : [],
            indices     : [],
            texcoord    : [],
            normals     : [],
        };

        Util.gridIndices( rtn.indices, lngSteps+1, latSteps+1, 0, false, true );

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Loop Around Hemisphere, Y Axis
        for( j=0; j <= latSteps; j ++ ){
            tj      = j / latSteps
            lat     = latRng * tj;
            s_lat   = Math.sin( lat );
            c_lat   = Math.cos( lat );

            // Loop from Pole to Pole
            for( i=0; i <= lngSteps; i++ ){
                ti      = i / lngSteps;

                //-----------------------------------
                // 3D Position
                lon     = lngRng * ti;
                s_lng   = Math.sin( lon );
                c_lng   = Math.cos( lon );

                x       = radius * s_lng * c_lat;  
                z       = radius * s_lng * s_lat;
                y       = radius * c_lng;

                rtn.vertices.push( x, y, z );

                //-----------------------------------
                // Normals
                len = 1 / Math.sqrt( x*x + y*y + z*z );
                rtn.normals.push( x * len, y * len, z * len );

                //-----------------------------------
                // UVs
                rtn.texcoord.push( ti, 1.0 - tj );
            }
        }

        return rtn;
    }

}

export default UVSphere;