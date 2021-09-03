
import Vec3 from "../Vec3.js";

class UniqueVertexGeo{
    map : { [key:string]: number } = {};
    geo : TGeo = {
        vertices    : [],
        indices     : [],
        normals     : [],
        texcoord    : [],
    };

    //#region GETTER / SETTER
    get vertexCount() : number{ return this.geo.vertices.length / 3; }
    //#endregion //////////////////////////////////////////////////////////////////

    //#region ADDING

    /** Add a Triangle by using 3 Points */
    addTri( a: TVec3, b: TVec3, c: TVec3 ) : this{
        const ai = this.addVert( a );
        const bi = this.addVert( b );
        const ci = this.addVert( c );
        this.geo.indices.push( ai, bi, ci );
        return this;
    }

    /** Adds a new vertex if it found in the map cache. Return back its vertex index */
    addVert( v: TVec3 ) : number{
        const x = Math.floor( v[ 0 ] * 100000 );
        const y = Math.floor( v[ 1 ] * 100000 );
        const z = Math.floor( v[ 2 ] * 100000 );
        const k = x + "_" + y + "_" + z;

        if( this.map[ k ] !== undefined ) return this.map[ k ];
        
        const i = this.geo.vertices.length / 3;
        this.geo.vertices.push( v[0], v[1], v[2] );
        this.map[ k ] = i;
        return i;
    }

    //#endregion //////////////////////////////////////////////////////////////////

    //#region ADDING BY SUB DIVISION

    /** Loops through the indices to find all the triangles, then creates new vertices by subdividing them */
    subdivGeo( geo: TGeo, div=2 ) : this{
        const a = new Vec3();
        const b = new Vec3();
        const c = new Vec3();
        for( let i=0; i < geo.indices.length; i+=3 ){
            a.fromBuf( geo.vertices, geo.indices[ i ]   * 3 );
            b.fromBuf( geo.vertices, geo.indices[ i+1 ] * 3 );
            c.fromBuf( geo.vertices, geo.indices[ i+2 ] * 3 );
            this.subdivTri( a, b, c, div );
        }

        return this;
    }

    /** Sub divides a triangle by adding new vertices and indicies. */
    subdivTri( a: TVec3, b: TVec3, c: TVec3, div=2 ): this{
        const irow  = [ [ this.addVert( a ) ] ];  // Index of each vert per rowl
        const seg_a = new Vec3();                 // Lerping
        const seg_b = new Vec3();
        const seg_c = new Vec3();
    
        let i, j, t, row;    
    
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Create new Vertices
        for( i=1; i <= div; i++ ){
            t = i / div;                            // Get Lerp T
            seg_b.fromLerp( a, b, t );              // Get Position of two sides of the triangle.
            seg_c.fromLerp( a, c, t );
    
            row = [ this.addVert( seg_b ) ];        // Add First Point in the Row
    
            // Loop the Remaining Points of the row
            for( j=1; j < i; j++ ){
                t = j / i;
                seg_a.fromLerp( seg_b, seg_c, t );
                row.push( this.addVert( seg_a ) );
            }
    
            row.push( this.addVert( seg_c ) );      // Add Last row point
            irow.push( row );                       // Save Row indexes for later.
        }
    
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Create Indices
        let ra, rb;
        for( i=1; i < irow.length; i++ ){
            ra = irow[ i-1 ];   // top Row
            rb = irow[ i ];     // bottom row
    
            // Create Quads if possible else just a triangle
            for( j=0; j < ra.length; j++ ){
                this.geo.indices.push( rb[ j ], rb[ j+1 ], ra[ j ] );
                if( j+1 < ra.length ) this.geo.indices.push( ra[ j ], rb[ j+1 ], ra[ j+1 ] );
            }
        }

        return this;
    }

    //#endregion //////////////////////////////////////////////////////////////////
}

export default UniqueVertexGeo;