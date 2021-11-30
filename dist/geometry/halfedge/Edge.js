//#region IMPORTS
import HalfEdge from './HalfEdge.js';
//#endregion
class Edge {
    index = -1;
    halfedge = -1;
    v0 = -1;
    v1 = -1;
    constructor(v0, v1, idx) {
        this.v0 = v0;
        this.v1 = v1;
        if (idx != undefined)
            this.index = idx;
    }
    reset() {
        this.halfedge = -1;
        this.v0 = -1;
        this.v1 = -1;
        return this;
    }
    getKey() { return Edge.key(this.v0, this.v1); }
    getPositions(top) {
        return [
            top.vertices.items[this.v0].pos,
            top.vertices.items[this.v1].pos,
        ];
    }
    getHalfEdge(top) { return top.edges.hedges[this.halfedge]; }
    getVertices(top) {
        return [
            top.vertices.items[this.v0],
            top.vertices.items[this.v1],
        ];
    }
    static key(v0, v1) {
        return (v0 < v1) ? v0 + '_' + v1 : v1 + '_' + v0;
    }
}
class EdgeCollection {
    top;
    edges = [];
    hedges = [];
    map = new Map();
    freeEdges = [];
    freeHEdges = [];
    constructor(top) {
        this.top = top;
    }
    getEdgePositions(idx) {
        const top = this.top;
        const edg = this.edges[idx];
        return [
            top.vertices.items[edg.v0].pos,
            top.vertices.items[edg.v1].pos,
        ];
    }
    add(v0, v1) {
        const top = this.top;
        const key = Edge.key(v0, v1);
        let idx = this.map.get(key);
        let edge;
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        // Get or Create new Edge
        if (idx == undefined) {
            //----------------------------------
            // Create Edge
            idx = this.edges.length;
            edge = new Edge(v0, v1, idx);
            this.edges.push(edge);
            this.map.set(key, idx);
            //----------------------------------
            // Create Half Edge Pairs
            const h0Idx = this.hedges.length;
            const h1Idx = h0Idx + 1;
            const [he0, he1] = HalfEdge.makePair(h0Idx, h1Idx, idx, v0, v1);
            this.hedges.push(he0, he1);
            //----------------------------------
            // Assign Half Edges to Vertices.
            //let vert = top.getVertex( v0 );
            //if( vert.halfedge == -1 ) vert.halfedge = h0Idx;
            //vert = top.getVertex( v1 );
            //if( vert.halfedge == -1 ) vert.halfedge = h1Idx;
            //----------------------------------
            // Assign first HE to edge
            edge.halfedge = h0Idx;
        }
        else {
            edge = this.edges[idx];
        }
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        //console.log( 'edge', v0, v1, key );
        //console.log( edge );
        //console.log( this.edges )
        //console.log( this.hedges );
        // Does Edge Already Exist?
        // If Edge does not, Create it
        // -- Create its first Half Edge.
        // -- Set Edge & Face Index to Half Edge.
        // -- return Half Edge Index
        // if Exists, check if current HE matches face ID if does, exit
        // -- if Twin Exists, Exit, can only have 2 faces per edge
        // -- if not exists, create it, set its values and return it.
        /*
        const key   = Edge.key( v0, v1 );
        let idx     = this.edgeMap.get( key );

        if( idx == undefined ){
            idx     = this.edges.length;
            const o = new Edge( idx, v0, v1 );
            // Create Half Edge with no Twin

            this.edges.push( o );
            this.edgeMap.set( key, idx );
        }else{
            // Edge Already Exists, create twin
        }

        return idx;
        */
        return edge;
    }
    getHalfEdgeByOrigin(heIdx, vertIdx) {
        let he = this.hedges[heIdx];
        if (he.vertex != vertIdx) { // Not Origin Vert
            he = this.hedges[he.twin]; // Check its twin
            if (he.vertex != vertIdx)
                return undefined; // No good, Vert might not belong to edge.
        }
        return he;
    }
    recycleEdge(eIdx) {
        console.log('recycleEdge');
        const edg = this.edges[eIdx];
        const key = edg.getKey();
        const aHe = edg.getHalfEdge(this.top);
        const bHe = aHe.getTwin(this.top);
        // reset Edge
        // reset HalfEdges
        // remove from Map
        // add Edge to Free
        // add HalfEdge to Free
    }
    iter() {
        let i = 0;
        const result = { value: { idx: 0, v0: null, v1: null }, done: false }, len = this.edges.length, next = () => {
            if (i >= len)
                result.done = true;
            else {
                const edge = this.edges[i];
                result.value.idx = edge.index;
                result.value.v0 = this.top.vertices.items[edge.v0];
                result.value.v1 = this.top.vertices.items[edge.v1];
                i++;
            }
            return result;
        };
        return { [Symbol.iterator]() { return { next }; } };
    }
}
export default Edge;
export { Edge, EdgeCollection };
