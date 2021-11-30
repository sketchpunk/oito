/* eslint-disable @typescript-eslint/no-explicit-any */
import Vec3 from "../../Vec3.js";
import CircularLinkedList from "../../object/CircularLinkedList.js";
// https://github.com/eliemichel/BMeshUnity
// #region BMESH TYPES
class Vertex {
    idx = null; // Index of Vertex, Gets filled in At Buffer Build time
    pos = new Vec3(); // Position
    edge = new CircularLinkedList(); // How many edges the vertex is part of
    //constructor(){}
    dispose() {
        this.edge.clear();
        this.edge = null;
        this.pos = null;
    }
}
class Edge {
    loop = new CircularLinkedList(); // All the Face Loops this edge is part of
    idx = null;
    a; // First Point that makes up the Edge
    b; // Second Point that makes up the edge
    constructor(va, vb) {
        this.a = va;
        this.b = vb;
    }
    containsVertex(v) { return (v === this.a || v === this.b); }
    otherVertex(v) { return (v === this.a) ? this.b : this.a; }
    dispose() {
        this.loop.clear();
        this.loop = null;
        this.a = null;
        this.b = null;
    }
}
class Loop {
    vert; // Starting Vert of the Edge for a Face
    edge; // The Edge of a face
    face; // Face
    /** Can have multiple normals per vert depending on the face or edge.
        If smooth shading, we average out all the normals
        If sharp edges, we duplicate each vertex of the edge so it keeps its normal
    */
    norm = new Vec3();
    constructor(v, e, f) {
        this.vert = v;
        this.edge = e;
        this.face = f;
    }
    dispose() {
        this.vert = null;
        this.edge = null;
        this.face = null;
        this.norm = null;
    }
}
class Face {
    vertCount = 0; // How many verts was used to create this face
    loop = new CircularLinkedList(); // List all the edges/vertices that make up the face
    //constructor(){}
    dispose() {
        this.loop.clear();
        this.loop = null;
    }
}
// #endregion ///////////////////////////////////////////////
class BMesh {
    vert_map = {}; // Lookup table to prevent duplicating vertices
    vertices = new Array();
    edges = new Array();
    loops = new Array();
    faces = new Array();
    useUniqueVertex = true;
    addVert(x, y, z) {
        if (x instanceof Float32Array || Array.isArray(x)) {
            y = x[1];
            z = x[2];
            x = x[0];
        }
        if (x === undefined || y === undefined || z === undefined)
            return null;
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Check if vertex position already exists
        let key = "";
        if (this.useUniqueVertex) {
            key = Math.floor(x * 1000) + "_" +
                Math.floor(y * 1000) + "_" +
                Math.floor(z * 1000);
            let idx;
            if ((idx = this.vert_map[key]) != undefined)
                return this.vertices[idx];
        }
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // New Vertex
        const v = new Vertex();
        v.pos.xyz(x, y, z); // Set Position
        v.idx = this.vertices.length; // Set Index in Array
        this.vertices.push(v); // Save to Array
        if (this.useUniqueVertex)
            this.vert_map[key] = v.idx; // Key to Index Mapping
        return v;
    }
    addEdge(va, vb) {
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        let edge = this.findEdge(va, vb);
        if (edge)
            return edge;
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        edge = new Edge(va, vb); // Edge
        edge.idx = this.edges.length; // TODO, Can get rid of this
        this.edges.push(edge); // Save to Global List
        va.edge.add(edge); // Link Edge to each vertex
        vb.edge.add(edge);
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        return edge;
        /*
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        let edge = this.find_edge( vert1, vert2 );
        if( edge ) return edge;
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        edge     = new Edge( vert1, vert2 );
        edge.idx = this.edges.length;
        this.edges.push( edge );
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Insert in vert1's edge list
        if ( vert1.edge == null ){
            vert1.edge = edge;
            edge.next1 = edge;
            edge.prev1 = edge;
        }else{
            edge.next1 = vert1.edge.next( vert1 ); // Get next edge
            edge.prev1 = vert1.edge;
            edge.next1.set_prev( vert1, edge );
            edge.prev1.set_next( vert1, edge );
        }
        if( vert2.edge == null ){
            vert2.edge = edge;
            edge.next2 = edge;
            edge.prev2 = edge;
        }else{
            edge.next2 = vert2.edge.next(vert2);
            edge.prev2 = vert2.edge;
            edge.next2.set_prev( vert2, edge );
            edge.prev2.set_next( vert2, edge );
        }
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        return edge;
        */
    }
    addFace(vert_ary, norm_ary) {
        if (vert_ary.length == 0)
            return null;
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Create or Find an Edge for every two points on the array
        const edge_ary = new Array(vert_ary.length);
        let i_prev = vert_ary.length - 1; // Start with the edge that closes the loop, Last -> First
        let i;
        for (i = 0; i < vert_ary.length; i++) {
            edge_ary[i_prev] = this.addEdge(vert_ary[i_prev], vert_ary[i]);
            i_prev = i;
        }
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Create Face Object and save it for array
        const f = new Face();
        //f.idx = this.faces.length;
        this.faces.push(f);
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Create a Loop List that connects the Verts/Edges
        // Of the faces in the order it was passed in.
        let loop, edge;
        for (i = 0; i < vert_ary.length; i++) {
            //----------------------------------
            edge = edge_ary[i];
            loop = new Loop(vert_ary[i], edge, f);
            //loop.idx = this.loops.length;
            //----------------------------------
            // Save normal if available
            if (norm_ary)
                loop.norm.copy(norm_ary[i]);
            //----------------------------------
            edge.loop.add(loop); // Save Loop Reference to Edge, to find all faces edge is attached too.
            f.loop.add(loop); // Loop for face links all verts & edges of a face, plus order of verts around.
            this.loops.push(loop); // Global Storage of loop
        }
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        f.vertCount = vert_ary.length;
        return f;
    }
    // #endregion ///////////////////////////////////////////////
    // #region MISC
    findEdge(va, vb) {
        // If either vertex has no edges, exist
        if (!va.edge.head || !vb.edge.head)
            return null;
        // Get Starting Nodes of Linked List
        let na = va.edge.head;
        let nb = vb.edge.head;
        do {
            // Any Edge that contains BOTH vertices
            if (na?.value?.containsVertex(vb))
                return na.value;
            if (nb?.value?.containsVertex(va))
                return nb.value;
            // Move onto Next Node
            na = na?.next;
            nb = nb?.next;
        } while (na != va.edge.head && nb != vb.edge.head); // Circular List, If next is first, exit
        return null;
    }
    reset() {
        let i;
        // eslint-disable-next-line no-prototype-builtins
        for (i in this.vert_map)
            if (this.vert_map.hasOwnProperty(i))
                delete this.vert_map[i];
        for (i of this.vertices)
            i.dispose();
        for (i of this.edges)
            i.dispose();
        for (i of this.loops)
            i.dispose();
        for (i of this.faces)
            i.dispose();
        this.vertices.length = 0;
        this.edges.length = 0;
        this.loops.length = 0;
        this.faces.length = 0;
    }
    // #endregion ///////////////////////////////////////////////
    // #region BUILDING
    buildVertices() {
        let v, ii;
        const cnt = this.vertices.length;
        const buf = new Float32Array(cnt * 3);
        for (let i = 0; i < cnt; i++) {
            v = this.vertices[i];
            v.idx = i; // Verts can be deleted/Removed, so IDX needs to be set before doing indices to link faces correctly.
            ii = i * 3; // Translate 
            buf[ii] = v.pos[0];
            buf[++ii] = v.pos[1];
            buf[++ii] = v.pos[2];
        }
        return buf;
    }
    buildIndices() {
        let f;
        let l;
        const ary = new Array();
        for (f of this.faces) {
            switch (f.loop.count) {
                // TRI ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
                case 3:
                    for (l of f.loop.iterNext())
                        ary.push(l?.vert.idx);
                    break;
                // QUAD ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
                case 4:
                    console.log("TODO - Build Indices needs to handle quad faces.");
                    break;
                // ERR ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
                default:
                    console.error("Face has less then 3 or more then 4 sides", f);
                    break;
            }
        }
        return new Uint16Array(ary);
    }
}
export default BMesh;
