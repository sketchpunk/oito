//#endregion
class HalfEdge {
    index = -1; // Index in the Array
    prev = -1; // Previous Half
    next = -1; // Next
    twin = -1; // Its Reverse Side
    edge = -1; // Edge it belongs too
    vertex = -1; // Vertex that starts the half edge
    face = -1; // Face Half Edge Belongs too.
    constructor(idx, twinIdx) {
        if (idx != undefined)
            this.index = idx;
        if (twinIdx != undefined)
            this.twin = twinIdx;
    }
    //#region GETTER OPERATIONS
    /** Get Next HalfEdge Object */
    getNext(top) { return top.edges.hedges[this.next]; }
    /** Get Prev HalfEdge Object */
    getPrev(top) { return top.edges.hedges[this.prev]; }
    /** Get the Next HE's Twin Object */
    getNextTwin(top) {
        if (this.next == -1)
            return null;
        const he = top.edges.hedges[this.next];
        return top.edges.hedges[he.twin];
    }
    /** Get the Twin's Next HE Object */
    getTwinNext(top) {
        const he = top.edges.hedges[this.twin];
        return (he.next != -1) ? top.edges.hedges[he.next] : null;
    }
    /** Get the Previous HE's Twin */
    getPrevTwin(top) {
        if (this.prev == -1)
            return null;
        const he = top.edges.hedges[this.prev];
        return top.edges.hedges[he.twin];
    }
    //#endregion
    //#region GETTERS
    getTwin(top) { return top.edges.hedges[this.twin]; }
    getVertex(top) { return top.vertices.items[this.vertex]; }
    getEdge(top) { return top.edges.edges[this.edge]; }
    getFace(top) { return top.faces.items[this.face]; }
    //#endregion
    //#region STATIC METHODS
    static makePair(ai, bi, ei, v0, v1) {
        const a = new HalfEdge(ai, bi);
        a.edge = ei;
        a.vertex = v0;
        //a.next      = bi;   // Assign Twin as its Next/Prev
        //a.prev      = bi;
        const b = new HalfEdge(bi, ai);
        b.edge = ei;
        b.vertex = v1;
        //b.next      = ai;   // Assign Twin as its Next/Prev
        //b.prev      = ai;
        return [a, b];
    }
}
export default HalfEdge;
