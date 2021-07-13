import Vec3     from "../Vec3.js";
import VRot90   from "../VRot90.js";

class OctaSphere{

    static get( subDiv=2, radius=1 ) : TGeoIVN{
        /* TODO : can probably use Equirectangular to genertate UV Coords out of Normals, Can use this GLSL as an example
        vec2 norm_uv( vec3 norm ){
            float lon   = atan( norm.z, norm.x );
            float lat   = acos( norm.y );
            vec2 uv     = vec2( lon, lat ) * ( 1.0 / 3.1415926535897932384626433832795 );
            uv.x        = 1.0 - ( uv.x * 0.5 + 0.5 ); // Remap and reverse Lon
            return uv;
        } */

        const rtn : TGeoIVN = { 
            indices  : [],
            vertices : [],
            normals  : [],
        };

        // Holds Starting indexes of each row since each row
        // has a different amount of vertices being used.
        const vrows : Array<number> = []; 

        this.genVerts( subDiv, radius, vrows, rtn.vertices, rtn.normals );
        this.genIndices( subDiv, vrows, rtn.indices );
        this.genNormals( rtn.vertices, rtn.normals );

        return rtn;
    }

    // #region CREATE POINTS
    // Create the Vertices and Normal Direction
    static genVerts( subdiv: number , radius: number, vrows: Array<number>, verts: Array<number>, norm: Array<number> ): void{
        const irow : Array<number> = [];                    // Starting Index of Each Row Of Points
        const buf     = this.genCorner( subdiv, irow );     // Base vertices
        const s_up    = new Vec3( 1,1,1 ).scale( radius );
        const s_dn    = new Vec3( 1,-1,1 ).scale( radius );
        const row_cnt = irow.length - 1;
        let i, cnt;

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Create the Equator
        vrows.push( verts.length/3 );
        this.repeatPoints( buf, irow[0], irow[1]-irow[0], s_up, verts, norm );

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Create the sphere 2 rows at a time, Moving toward the poles
        for( i=1; i < row_cnt; i++ ){
            cnt = irow[ i+1 ] - irow[ i ];                         // How Many Points in One Row
            
            vrows.push( verts.length/3 );
            this.repeatPoints( buf, irow[i], cnt, s_up, verts, norm ); // Upper Row

            vrows.push( verts.length/3 );
            this.repeatPoints( buf, irow[i], cnt, s_dn, verts, norm ); // Lower Row
        }

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Create Pole Points
        const v = new Vec3();
        i = irow[ row_cnt ] * 3;

        vrows.push( verts.length/3 );
        v.fromBuf( buf, i ).pushTo( verts );//.norm().pushTo( norm );

        vrows.push( verts.length/3 );
        v.fromBuf( buf, i ).mul( s_dn ).pushTo( verts );//.norm().pushTo( norm );
    }

    // genVerts helper : Duplicate and Rotate a set of vertices, 
    static repeatPoints( buf:Array<number>, offset: number, cnt: number, scl: TVec3, verts: Array<number>, norm: Array<number> ) : void{
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        const fn    = [ ()=>{}, VRot90.yn, VRot90.y2, VRot90.yp ];
        const len   = cnt - 1; // Skip the last Point
        const rng   = len * 4; // Repeat the Points 4 times, Skipping the last Point
        const v     = new Vec3();
        let bi; // Buffer Index
        let fi; // Rot Fn Idx
        
        for( let i=0; i < rng; i++ ){
            fi = Math.floor( i / len );         // Function Index, 4 Groups, each one has a Rotation Applied
            bi = (( i % len ) + offset ) * 3;   // Buffer Index, repeat the verts

            v.fromBuf( buf, bi );
            fn[ fi ]( v, v );

            v   .norm()
                .mul( scl )
                .pushTo( verts );
        } 
    }

    static genNormals( verts: Array<number>, out: Array<number> ): void{
        let v;
        for( v of Vec3.bufIter( verts ) ) v.norm().pushTo( out );
    }
    // #endregion /////////////////////////////////////////////////////////////////////////////

    // #region INDICES
    // Create the Triangle indices for the Octasphere
    static genIndices( subdiv:number, vrows: Array<number>, out: Array<number> ): void{
        let a_len: number, b_len: number, q_cnt: number, q_loop: number,
            a, b, c, d;

        // Create a ring of triangles bases on 2 rows of vertices
        // The Bottom Half of the sphere's vertices are mirrored, this causes a problem
        // where the face winding needs to be in reverse.
        const ring = ( ai: number, bi: number, rev:boolean )=>{
            let aii = 0, bii = 0; // rows are iregular, so need to move 2 indices
            for( let j=0; j < q_loop; j++ ){
                //---------------------------------
                // Define the Quad by suing the top and bottom row
                a = ai + aii;  b = bi + bii;
                c = b + 1;     d = a + 1;
                
                //---------------------------------
                if( aii + 1 >= a_len ) d = ai;              // At end of ring, Loop back to start of the ring
                if( !rev )  out.push( a, b, c, c, d, a );
                else        out.push( c, b, a, a, d, c );
        
                //---------------------------------
                // Test for the extra triangle, With iregular sizes per row, the only
                // I see is that for each corner there is a set of quads, but with an extra
                // triangle at the end, 
                if( ((j+1) % q_cnt) == 0 ){ 
                    bii += 1;               // Move ahead to start fresh with a quad at the next corner 
                    if( bii+1 < b_len ) ( !rev )? out.push( d, c, c+1 ) : out.push( c+1, c, d );    // Extra tri
                    else                ( !rev )? out.push( d, c, bi )  : out.push( bi, c, d );     // FINAL extra tri,tie back to start
                }
                
                //---------------------------------
                // Move the row indicies forward
                aii++; bii++; 
            }
        };

        // Last two vrows items are the index of the poles.
        // So the triangles just links the final row woth the pole point
        const pole = ( pidx: number, rev:boolean )=>{
            b_len = vrows[ pidx-1 ] - vrows[ pidx-2 ];
            a     = vrows[ pidx ];
            b     = vrows[ pidx-2 ];

            for( let j=0; j < b_len; j++ ){
                c = b + j;                  // Compute the bottom row start
                d = b + ((j + 1) % b_len);  // If last point, need to  loop back to start
                
                if( !rev )  out.push( a, c, d );
                else        out.push( d, c, a );
            }
        };

        //----------------------------------------
        // Build the EQUATOR Rows
        a_len   = vrows[ 2 ] - vrows[ 1 ];  // Hoq Long is the Top Row, Determine by using the starting index of each row
        b_len   = vrows[ 1 ] - vrows[ 0 ];  // How long is the bot row, 
        q_cnt   = b_len / 4 - 1;            // How many quads per corner can be created  
        q_loop  = q_cnt * 4;                // Total Number of quads being made per row
        ring( vrows[1], vrows[0], false );  // Make top Ring
        ring( vrows[2], vrows[0], true );   // Make Bot Ring, with rev winding

        //----------------------------------------
        // Build Rings between Equator and Poles
        for( let i=1; i < vrows.length-4; i+=2 ){
            a_len   = vrows[ i+3 ] - vrows[ i+2 ];
            b_len   = vrows[ i+1 ] - vrows[ i ];
            q_cnt   = b_len / 4 - 1;
            q_loop  = q_cnt * 4;
            ring( vrows[i+2], vrows[i], false );
            ring( vrows[i+3], vrows[i+1], true );
        }

        //----------------------------------------
        // Use the Pole points and final rows to finish the sphere.
        const ri_last = vrows.length - 1;
        pole( ri_last-1, false );
        pole( ri_last, true );
    }
    // #endregion /////////////////////////////////////////////////////////////////////////////

    // #region SPHERE CORNER
    // Create the base vertices that forms the corner of
    // of Octa Sphere based on sub division Value.
    // The Main concept is that you form 2 vertical arcs
    // that are 90 degrees apart. Then create inbetween
    // arcs by rotating the verts of the first arc towards the second.
    // Build the corner up from the equator to pole horizontally,
    // like one row at a time.
    // Since each row of verts have a different size, Its best to 
    // keep track the starting index of each row for further processing
    static genCorner( subdiv: number, irow: Array<number> ) : Array<number>{
        const out : Array<number> = []; // Flat Array of Vertex Points
        const pi_h = Math.PI * 0.5;     // Range of Arc being created
        const n    = 2 ** subdiv;       
        const a    = new Vec3();
        const b    = new Vec3();
        let cnt    = 0;
        let rad, s, c;

        for( let i=0; i < n; i++ ){
            irow.push( cnt );           // Starting Index of Each Row
            cnt += n - i + 1;           // How Many points created for this row
            
            rad = pi_h * i / n;         // Vertical Angle         
            s   = Math.sin( rad );      
            c   = Math.cos( rad );
            a.xyz( 0, s, c );           // Left Point
            b.xyz( c, s, 0 );           // Right Point

            a.pushTo( out );           // Start of Row
            this.arcLerp( a, b, n-i, out ); // in Between Verts
            b.pushTo( out );           // End of Row
        }

        out.push( 0, 1, 0 );            // Pole Point
        irow.push( cnt );               // Pole Index

        return out;
    }

    // Create the inbetween points of two arcs.
    // Need to compute a rotating axis for each row,
    // doing so will make each arc spherical
    static arcLerp( a: TVec3, b: TVec3, seg_num: number, ary: Array<number> ) : void{
        if( seg_num < 2 ) return;                   // Dont bother making points

        const ang  = Math.acos( Vec3.dot( a, b ) ); // Vec3.angle( a, b ); 
        const axis = Vec3.cross( a, b ).norm();     // MUST normalize rotation axis, 
        const inc  = ang / seg_num;                 // Angle Incremeter for each pass
        const v    = new Vec3();

        for( let i=1; i < seg_num; i++ ){
            v
                .fromAxisAngle( axis, i*inc, a )  // Rotate the first point
                .pushTo( ary );                   // Save it to array buffer
        }
    }
    // #endregion /////////////////////////////////////////////////////////////////////////////

}

export default OctaSphere;