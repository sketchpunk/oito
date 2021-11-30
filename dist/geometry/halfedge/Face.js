//#endregion
class Face {
    index = -1;
    halfedge = -1;
    vertexCount = 0; //TODO Need to fill this.
    constructor(idx) {
        if (idx !== undefined)
            this.index = idx;
    }
    getHalfEdge(top) { return top.edges.hedges[this.halfedge]; }
    getVertexHalfEdge(top, vIdx) {
        let lmt = 0, he = top.getHalfEdge(this.halfedge);
        do {
            if (he.vertex === vIdx)
                return he;
            he = he.getNext(top);
        } while (he.index != this.halfedge && lmt++ < 1000);
        return null;
    }
}
class FaceCollection {
    //#region MAIN
    top;
    items = [];
    constructor(top) {
        this.top = top;
    }
    //#endregion
    getVertices(fIdx) {
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        const f = this.items[fIdx];
        if (f.halfedge == -1)
            return [];
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        const verts = this.top.vertices;
        const hedges = this.top.edges.hedges;
        const heStart = f.halfedge;
        const rtn = [];
        let he;
        let v;
        let lmt = 0;
        let heIdx = heStart;
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        do {
            he = hedges[heIdx]; // Get Current Half Edge
            v = verts.items[he.vertex]; // Get Its origin Vertex
            heIdx = he.next; // Get Index to Next Half Edge
            lmt++;
            rtn.push(v);
        } while (heIdx != heStart && heIdx != -1 && lmt < 1000);
        return rtn;
    }
    delVertex(fIdx, vIdx) {
        console.log('Face.delVertex : TODO - Check Vert Count');
        const top = this.top;
        const face = this.items[fIdx];
        const aHe = face.getVertexHalfEdge(top, vIdx); // Vert Forward HE
        if (!aHe) {
            console.warn('could not find vertex halfedge in face');
            return;
        }
        const bHe = aHe.getPrev(top); // Vert Backward HE
        const aa = aHe.getNext(top); // HE AFTER Forward
        const bb = bHe.getPrev(top); // HE BEFORE Backard
        // Deleting Two edges, means need a new edge to connect the two ends
        const edg = top.edges.add(bHe.vertex, aa.vertex);
        const lHe = top.edges.getHalfEdgeByOrigin(edg.halfedge, bHe.vertex);
        if (!lHe) {
            console.log('Error that should never happen since Link Edge was just created');
            return;
        }
        lHe.face = fIdx; // Assign Face to Link Edge
        lHe.next = aa.index; // Set Next HE to Link
        lHe.prev = bb.index; // Set Prev HE t0 Link
        aa.prev = lHe.index; // Set Next Forward to Link
        bb.next = lHe.index; // set Prev Backard to Link
        face.vertexCount--; // Decrement Vertex Count
        console.log('Face.delVertex : TODO - Reassign Vertices HalfEdge Values');
        //bHe.vertex, aa.vertex
        // May also need to reset face's halfEdge
    }
    add(verts) {
        const top = this.top;
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        if (verts.length == 0)
            return -1;
        if (isNaN(verts[0])) {
            const v = [];
            let i;
            for (i of verts)
                v.push(top.vertices.add(i));
            verts = v;
        }
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        const fIdx = this.items.length;
        const face = new Face(fIdx);
        const vLen = verts.length;
        let i, ii, edge, vert;
        let he;
        let heStart;
        let hePrev;
        for (i = 0; i < vLen; i++) {
            ii = (i + 1) % vLen;
            edge = top.edges.add(verts[i], verts[ii]);
            he = top.edges.getHalfEdgeByOrigin(edge.halfedge, verts[i]);
            vert = top.getVertex(verts[i]);
            //-------------------------------------------
            if (he == undefined) {
                console.error('Unable to find HalfEdge with the Origin Vert Index ', verts[i]);
                return -1;
            }
            //console.log( 'face', fIdx, 'HE', he.index );
            //-------------------------------------------
            if (!heStart)
                heStart = he; // Save First HalfEdge of Loop
            if (vert.halfedge == -1)
                vert.halfedge = he.index; // Assign HE to Vert
            he.face = fIdx; // Assign Face to HalfEdge
            //-------------------------------------------
            if (hePrev) {
                hePrev.next = he.index; // Set Previous HalfEdge's next HE
                he.prev = hePrev.index; // Set HalfEdge's previous HE
            }
            //-------------------------------------------
            hePrev = he;
            //console.log( 'x', i, he );
        }
        heStart.prev = hePrev.index; // Connect first > last
        hePrev.next = heStart.index; // Connect Last > First
        face.halfedge = heStart.index;
        this.items.push(face);
        return fIdx;
    }
}
export default Face;
export { Face, FaceCollection };
