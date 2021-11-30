//#region IMPORTS
import HalfEdge                     from './HalfEdge.js';
import { Edge, EdgeCollection }     from './Edge.js';
import { Face, FaceCollection }     from './Face.js';
import { Vertex, VertexCollection } from './Vertex.js';
//#endregion

// http://allenchou.net/2014/02/game-physics-implementing-support-function-for-polyhedrons-using-half-edges/
// https://github.com/YCAMInterlab/mda.js/tree/master/mda/Core
// https://observablehq.com/@esperanc/half-edge-data-structure
// https://observablehq.com/@2talltim/mesh-data-structures-traversal
// https://kaba.hilvi.org/homepage/blog/halfedge/halfedge.htm
// https://gist.github.com/mpearson/8bef18403044eb59951800006d0a3c63
// https://observablehq.com/@esperanc/mesh-data-structures-traversal

// Operations
// -- Delete Vert ( Update Face )
// -- Delete Edge ( Update Face )
// -- Extrude Edge - Generates new face if no Twin.
// -- New Face from 2 edges ( if both have no twin )

class Topology{
    //#region MAIN
    vertices    = new VertexCollection( this );
    edges       = new EdgeCollection( this );
    faces       = new FaceCollection( this );
    //#endregion

    //#region GETTERS
    get faceCount(){ return this.faces.items.length; }

    getVertex( idx: number )    : Vertex { return this.vertices.items[ idx ]; }
    getHalfEdge( idx: number )  : HalfEdge { return this.edges.hedges[ idx ]; }
    getEdge( idx: number )      : Edge { return this.edges.edges[ idx ]; }
    getFace( idx: number )      : Face { return this.faces.items[ idx ]; }
    //#endregion

    delVertex( vIdx: number ): void{
        const vert      = this.getVertex( vIdx );
        const aryEdges  = vert.getAllEdges( this );
        const aryFaces : Set<number> = new Set();
        
        let he: HalfEdge, face: number, edg: Edge;

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Get List of Faces
        for( edg of aryEdges ){
            he  = edg.getHalfEdge( this );

            if( he.face != -1 )                             aryFaces.add( he.face );
            if( (face = he.getTwin( this ).face) != -1 )    aryFaces.add( face );
        }

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Allow Face to re compute its face with missing vert
        for( face of aryFaces ){
            this.faces.delVertex( face, vIdx );
        }

        for( edg of aryEdges ){
            this.edges.recycleEdge( edg.index );
        }

        /*
        Deleting a Vertex.
        - Find All Edges that the vertex is part of
        - Get all Half Edges the vertex is part of
        -- Using HE, rewiring any face that will still have at least 3 points after del
        -- Update Edge's Remaining Vertices with new HalfEdge index if needed.
        -- Recycle Edges
        -- Recycle Vertex
        -- Recycle HalfEdges
        */
    }
}

export default Topology;