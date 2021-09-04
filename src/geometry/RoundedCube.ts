import Util     from "./extra/Util.js";
import VRot90   from "../VRot90.js";
import Vec3     from "../Vec3.js";
import Maths    from "../Maths.js";

//###############################################################################################

class RoundedCube{
    
    static get( sx=1, sy=1, sz=1, radius=0.2, cells=4 ) : TGeo{
        const panel = this.edgeGrid( sx, sy, sz, radius, cells );  // Top Panel
        const rtn : TGeo = {
            vertices : Array.from( panel.vertices ),
            indices  : Array.from( panel.indices ),
            texcoord : Array.from( panel.texcoord ),
            normals  : Array.from( panel.normals ),
        };

        this.geoRotMerge( rtn, panel, VRot90.xp );          // Front
        this.geoRotMerge( rtn, panel, VRot90.xp_yp );       // Left
        this.geoRotMerge( rtn, panel, VRot90.xp_yp_yp );    // Back
        this.geoRotMerge( rtn, panel, VRot90.xp_yn );       // Right
        this.geoRotMerge( rtn, panel, VRot90.xp_xp );       // Bottom

        return rtn;
    }

    /**  Create a Grid with most of the vertices pushed to the 4 corners, then curve them.
    Size X,Y,Z, Radius, Cell Count ( How many divisions our edges should have) */
    static edgeGrid( sx=2, sy=2, sz=2, r=0.5, cells=4 ) :TGeo {
        let i, j, t, s;
        const   mx      = sx / 2,
                my      = sy / 2,    
                mz      = sz / 2,
                steps   = ( cells + 1 ) * 2;

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Create Step Pattern, 0, -1, -2, -n, n, 2, 1, 0
        // Makes it easy to create all the verts spread out to the two ends of the quad
        const step_ary = new Array( steps );
        for( i=0; i <= cells; i++ ){
            step_ary[ steps-i-1 ] = i;  // Positive Side
            step_ary[ i ]         = -i; // Negative Side
        }

        // Origin Point to use when curving the corners
        // Use corners kinda like Marching Squares
        const corners = [
            new Vec3( r-mx, my-r, r-mz ), // Top Left
            new Vec3( mx-r, my-r, r-mz ), // Top Right
            new Vec3( r-mx, my-r, mz-r ), // Bot Left
            new Vec3( mx-r, my-r, mz-r ), // Bot Right
        ];

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        const rtn : TGeo = {
            vertices : [],
            indices  : [],
            texcoord : [],
            normals  : [],
        };

        const v = new Vec3();
        let bit, c, x, z, uv_y;

        Util.gridIndices( rtn.indices, steps, steps, 0, false, true );

        // Rows
        for( j=0; j < steps; j++ ){
            t    = step_ary[ j ] / cells;    // Compute Lerp Time
            s    = ( j <= cells )? -1 : 1;   // Flip Signs halfway
            z    = mz * s + r * -t;          // From out > in, subtract Radius from Max Size
            bit  = ( j <= cells )? 0 : 2;    // Top or Bottom Origin Points
            uv_y = Maths.norm( -mz, mz, z );      // Map Z and Normalize the Value

            // Columns
            for( i=0; i < steps; i++ ){
                //-----------------------------------
                t = step_ary[ i ] / cells;   // Compute Lerp Time
                s = ( i <= cells )? -1 : 1;  // Flip Signs halfway
                x = mx * s + r * -t;         // From out > in, subtract Radius from Max Size
                c = corners[ bit + (( i <= cells )? 0 : 1 ) ]; // Corner Origin Point

                //-----------------------------------
                v   .xyz( x, my, z )            // Set our Vertex 
                    .sub( c )                   // Get Direction from origin to Point
                    .norm()                     // Normalize Direction
                    .pushTo( rtn.normals )      // Save to normals before converting it into vertex position
                    
                    .scale( r )                 // Scale by Sphere Radius
                    .add( c )                   // Move it away from origin in new curled position
                    .pushTo( rtn.vertices );    // Save to Array

                //-----------------------------------
                rtn.texcoord.push( Maths.norm( -mx, mx, x ), uv_y );
            }
        }

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        return rtn
    }

    /**  Rotate Vertices/Normals, then Merge All the Vertex Attributes into One Geo */
    static geoRotMerge( geo: TGeo, obj: TGeo, fn_rot :( a:TVec3, b:TVec3 )=>TVec3 ) : void{
        const offset  = geo.vertices.length / 3;
        const len     = obj.vertices.length;
        const v       = new Vec3(); 
        const o       = new Vec3();
        let i;

        for( i=0; i < len; i+=3 ){
            // Rotate Vertices
            v.fromBuf( obj.vertices, i );
            fn_rot( v, o );
            geo.vertices.push( o[ 0 ], o[ 1 ], o[ 2 ] );

            // Rotate Normal
            v.fromBuf( obj.vertices, i );
            fn_rot( v, o );
            geo.normals.push( o[ 0 ], o[ 1 ], o[ 2 ] );
        }

        for( i of obj.texcoord ) geo.texcoord.push( i );
        for( i of obj.indices )  geo.indices.push( offset + i );
    }

}

//###############################################################################################

export default RoundedCube;